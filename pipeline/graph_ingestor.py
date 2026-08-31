"""
pineSAW Real-Time Graph Ingestion & Identity Resolution Engine
--------------------------------------------------------------
Kafka consumer listening to raw darknet/Telegram event streams, executing entity
extraction, and constructing real-time property graphs in Neo4j/Memgraph via Cypher queries.
"""

import asyncio
import json
import logging
from typing import Dict, Any, Optional
from aiokafka import AIOKafkaConsumer
from neo4j import AsyncGraphDatabase, AsyncDriver

from entity_extractor import HighSpeedEntityExtractor, ExtractedIntelligenceArtifact

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("GraphIngestor")


class Neo4jGraphIngestionWorker:
    def __init__(
        self,
        neo4j_uri: str = "bolt://localhost:7687",
        neo4j_auth: tuple = ("neo4j", "pinesaw_threat_intel_2026"),
        kafka_bootstrap_servers: str = "localhost:9092",
        kafka_topics: list = ["raw.darknet.dom", "raw.telegram.events"]
    ):
        self.neo4j_uri = neo4j_uri
        self.neo4j_auth = neo4j_auth
        self.kafka_servers = kafka_bootstrap_servers
        self.kafka_topics = kafka_topics

        self.driver: Optional[AsyncDriver] = None
        self.extractor = HighSpeedEntityExtractor()

    async def init_neo4j(self):
        """Initialize Neo4j Bolt driver and setup schema constraints/indexes."""
        try:
            self.driver = AsyncGraphDatabase.driver(self.neo4j_uri, auth=self.neo4j_auth)
            await self.setup_constraints()
            logger.info(f"Connected to Neo4j Graph DB at {self.neo4j_uri}")
        except Exception as e:
            logger.warning(f"Neo4j connection unavailable ({e}). Running in mock/stdout mode.")
            self.driver = None

    async def setup_constraints(self):
        """Create uniqueness constraints for high-speed MERGE operations."""
        if not self.driver:
            return

        constraints = [
            "CREATE CONSTRAINT IF NOT EXISTS FOR (v:Vendor) REQUIRE v.alias IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (w:CryptoWallet) REQUIRE w.address IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (p:PGPKey) REQUIRE p.fingerprint IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (c:ContactHandle) REQUIRE c.handle IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (l:Listing) REQUIRE l.url IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (m:Marketplace) REQUIRE m.name IS UNIQUE"
        ]

        async with self.driver.session() as session:
            for query in constraints:
                try:
                    await session.run(query)
                except Exception as e:
                    logger.debug(f"Constraint creation note: {e}")

    async def upsert_artifact_to_graph(self, artifact: ExtractedIntelligenceArtifact):
        """
        Executes parameterized Cypher queries to build the identity resolution graph:
        (Vendor)-[:POSTED_LISTING]->(Listing)-[:OPERATES_ON]->(Marketplace)
        (Vendor)-[:OWNS_WALLET]->(CryptoWallet)
        (Vendor)-[:USES_PGP]->(PGPKey)
        (Vendor)-[:LINKED_TO]->(ContactHandle)
        """
        vendor_alias = artifact.vendor_alias or f"Unknown_Vendor_{artifact.artifact_id[-4:]}"
        marketplace_name = artifact.marketplace or "Darknet Market"

        cypher_query = """
        // 1. Merge Marketplace & Listing
        MERGE (m:Marketplace {name: $marketplace_name})
        MERGE (l:Listing {url: $url})
        ON CREATE SET 
            l.id = $artifact_id,
            l.threat_tier = $threat_tier,
            l.created_at = datetime()
        MERGE (l)-[:OPERATES_ON]->(m)

        // 2. Merge Vendor
        MERGE (v:Vendor {alias: $vendor_alias})
        ON CREATE SET v.first_seen = datetime(), v.risk_score = 75
        MERGE (v)-[:POSTED_LISTING]->(l)

        // 3. Merge Crypto Wallets
        WITH v, l
        UNWIND $wallets AS w
        MERGE (wallet:CryptoWallet {address: w.address})
        ON CREATE SET wallet.network = w.network, wallet.type = w.address_type
        MERGE (v)-[:OWNS_WALLET]->(wallet)
        MERGE (l)-[:ACCEPTS_PAYMENT]->(wallet)

        // 4. Merge Communication Handles
        WITH v
        UNWIND $handles AS h
        MERGE (handle:ContactHandle {handle: h.handle})
        ON CREATE SET handle.platform = h.platform
        MERGE (v)-[:LINKED_TO]->(handle)

        // 5. Merge PGP Fingerprints
        WITH v
        UNWIND $pgp_fps AS fp
        MERGE (pgp:PGPKey {fingerprint: fp})
        MERGE (v)-[:USES_PGP]->(pgp)

        // 6. Cross-Entity Identity Resolution: If two vendors share the same PGP or Wallet, link them
        WITH v
        MATCH (v)-[:USES_PGP]->(p:PGPKey)<-[:USES_PGP]-(v2:Vendor)
        WHERE v <> v2
        MERGE (v)-[:CO_IDENTIFIED_WITH {reason: 'SHARED_PGP_KEY'}]->(v2)
        """

        params = {
            "marketplace_name": marketplace_name,
            "url": artifact.source_url,
            "artifact_id": artifact.artifact_id,
            "threat_tier": artifact.threat_tier,
            "vendor_alias": vendor_alias,
            "wallets": [w.model_dump() for w in artifact.crypto_wallets],
            "handles": [h.model_dump() for h in artifact.contact_handles],
            "pgp_fps": artifact.pgp_fingerprints
        }

        if self.driver:
            async with self.driver.session() as session:
                await session.run(cypher_query, params)
                logger.info(f"✔ Successfully merged artifact [{artifact.artifact_id}] into Neo4j graph.")
        else:
            logger.info(f"[OFFLINE NEO4J] Would execute Cypher MERGE for Vendor '{vendor_alias}' ({len(artifact.crypto_wallets)} Wallets, {len(artifact.contact_handles)} Handles).")

    async def start_consumer(self):
        """Start Kafka consumer loop and ingest streaming events into graph."""
        await self.init_neo4j()

        consumer = AIOKafkaConsumer(
            *self.kafka_topics,
            bootstrap_servers=self.kafka_servers,
            group_id="pinesaw-graph-ingestors",
            value_deserializer=lambda m: json.loads(m.decode("utf-8")),
            auto_offset_reset="latest"
        )

        try:
            await consumer.start()
            logger.info(f"Kafka Consumer listening on topics {self.kafka_topics}...")
            async for msg in consumer:
                payload_dict = msg.value
                url = payload_dict.get("url", "unknown_source")
                html = payload_dict.get("html_content") or payload_dict.get("message", "")

                # Extract entities
                artifact = self.extractor.process_raw_dom(url, html)
                
                # Push to Graph
                await self.upsert_artifact_to_graph(artifact)

        except Exception as e:
            logger.error(f"Kafka consumer error: {e}")
        finally:
            await consumer.stop()
            if self.driver:
                await self.driver.close()


if __name__ == "__main__":
    ingestor = Neo4jGraphIngestionWorker()
    
    # Test single-batch execution
    async def test_run():
        await ingestor.init_neo4j()
        sample_artifact = ingestor.extractor.process_raw_dom(
            "http://genesis4xyt6z9a1.onion/listing/84920",
            "VENDOR: ShadowBroker | BTC: bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq | Telegram: @shadow_broker_t | PGP: -----BEGIN PGP PUBLIC KEY BLOCK----- mQENBF... -----END PGP PUBLIC KEY BLOCK-----"
        )
        sample_artifact.vendor_alias = "ShadowBroker"
        await ingestor.upsert_artifact_to_graph(sample_artifact)
        if ingestor.driver:
            await ingestor.driver.close()

    asyncio.run(test_run())
