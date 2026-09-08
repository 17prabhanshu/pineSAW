"""
Graph Persister for Telegram OSINT
Integrates normalized messages, extracted IOCs, and explainable risk scores
directly into pineSAW's existing SQLite database (prisma/dev.db)
utilizing existing Entity, Relationship, Evidence, Alert, and ActivityEvent schemas.
"""

import os
import sqlite3
import uuid
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Tuple

from .models import NormalizedTelegramMessage, ExtractedIOC, ExplainableRiskScore


class TelegramGraphPersister:
    """
    Persists threat-intelligence entities, evidence-backed relationships,
    cryptographic provenance hashes, and investigative alerts to the existing SQLite DB.
    """

    def __init__(self, db_path: Optional[str] = None):
        if db_path is None:
            # Default to pineSAW's existing prisma/dev.db
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
            db_path = os.path.join(base_dir, "prisma", "dev.db")
        self.db_path = db_path

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def persist_result(
        self,
        message: NormalizedTelegramMessage,
        iocs: List[ExtractedIOC],
        risk_score: ExplainableRiskScore
    ) -> Dict[str, Any]:
        """
        Stores all components of an ingested message into the pineSAW graph.
        Returns created entity and relationship IDs.
        """
        now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        persisted_entity_ids: List[str] = []
        persisted_relationship_ids: List[str] = []
        created_alert_id: Optional[str] = None

        with self._get_connection() as conn:
            cur = conn.cursor()

            # 1. Upsert Source Channel Entity (PLATFORM)
            source_label = f"@{message.source_id}"
            cur.execute("SELECT id FROM Entity WHERE label = ? AND type = 'PLATFORM'", (source_label,))
            source_row = cur.fetchone()
            if source_row:
                source_entity_id = source_row["id"]
            else:
                source_entity_id = f"ent-tg-{uuid.uuid4().hex[:8]}"
                cur.execute(
                    """
                    INSERT INTO Entity (id, type, label, confidence, priorityScore, riskFactors, createdAt, updatedAt)
                    VALUES (?, 'PLATFORM', ?, 1.0, ?, ?, ?, ?)
                    """,
                    (
                        source_entity_id,
                        source_label,
                        int(risk_score.total_score),
                        json.dumps({"source_type": "TELEGRAM_PUBLIC", "dominant_flags": risk_score.dominant_flags}),
                        now_iso,
                        now_iso
                    )
                )
            persisted_entity_ids.append(source_entity_id)

            # 2. Upsert Extracted Entities
            extracted_entity_ids: List[Tuple[str, str, str]] = [] # (entity_id, entity_type, label)

            for ioc in iocs:
                # Map generic IOC types to pineSAW Entity schema types
                if ioc.entity_type == "PAYMENT_INDICATOR":
                    ent_type = "WALLET"
                elif ioc.entity_type == "CONTENT_INDICATOR":
                    ent_type = "LISTING"
                elif ioc.entity_type == "PUBLIC_HANDLE":
                    ent_type = "IDENTIFIER"
                else:
                    ent_type = "IDENTIFIER"

                label = ioc.entity.strip()
                cur.execute("SELECT id, priorityScore FROM Entity WHERE label = ? AND type = ?", (label, ent_type))
                row = cur.fetchone()
                if row:
                    ent_id = row["id"]
                    # Update priority if new risk score is higher
                    if int(risk_score.total_score) > (row["priorityScore"] or 0):
                        cur.execute(
                            "UPDATE Entity SET priorityScore = ?, updatedAt = ? WHERE id = ?",
                            (int(risk_score.total_score), now_iso, ent_id)
                        )
                else:
                    ent_id = f"ent-ioc-{uuid.uuid4().hex[:8]}"
                    risk_factors_json = json.dumps({
                        "category": ioc.category,
                        "source_message_id": ioc.source_message_id,
                        "confidence": ioc.confidence,
                        "snippet": ioc.context_snippet
                    })
                    cur.execute(
                        """
                        INSERT INTO Entity (id, type, label, confidence, priorityScore, riskFactors, createdAt, updatedAt)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            ent_id,
                            ent_type,
                            label,
                            ioc.confidence,
                            int(risk_score.total_score),
                            risk_factors_json,
                            now_iso,
                            now_iso
                        )
                    )
                persisted_entity_ids.append(ent_id)
                extracted_entity_ids.append((ent_id, ent_type, label))

            # 3. Create Evidence-Backed Relationships
            for ent_id, ent_type, label in extracted_entity_ids:
                if ent_type == "LISTING":
                    rel_type = "LISTS"
                elif ent_type == "WALLET":
                    rel_type = "TRANSACTS_WITH"
                elif ent_type == "IDENTIFIER" and label.startswith("@"):
                    rel_type = "COMMUNICATES_WITH"
                else:
                    rel_type = "ASSOCIATED_WITH"

                # Check if relationship already exists
                cur.execute(
                    "SELECT id, evidenceCount FROM Relationship WHERE sourceId = ? AND targetId = ? AND type = ?",
                    (source_entity_id, ent_id, rel_type)
                )
                rel_row = cur.fetchone()
                provenance_data = json.dumps({
                    "source_message_id": message.message_id,
                    "first_seen": message.timestamp,
                    "last_seen": message.timestamp,
                    "relationship_type": rel_type,
                    "raw_hash": message.raw_hash
                })

                if rel_row:
                    rel_id = rel_row["id"]
                    cur.execute(
                        "UPDATE Relationship SET evidenceCount = evidenceCount + 1, provenance = ? WHERE id = ?",
                        (provenance_data, rel_id)
                    )
                else:
                    rel_id = f"rel-{uuid.uuid4().hex[:8]}"
                    cur.execute(
                        """
                        INSERT INTO Relationship (id, sourceId, targetId, type, confidence, evidenceCount, provenance, createdAt)
                        VALUES (?, ?, ?, ?, ?, 1, ?, ?)
                        """,
                        (rel_id, source_entity_id, ent_id, rel_type, 0.95, provenance_data, now_iso)
                    )
                persisted_relationship_ids.append(rel_id)

            # Inter-entity relationships (e.g. Public Handle -> Wallet)
            handles = [e for e in extracted_entity_ids if e[1] == "IDENTIFIER" and e[2].startswith("@")]
            wallets = [e for e in extracted_entity_ids if e[1] == "WALLET"]
            for h in handles:
                for w in wallets:
                    cur.execute(
                        "SELECT id FROM Relationship WHERE sourceId = ? AND targetId = ?",
                        (h[0], w[0])
                    )
                    if not cur.fetchone():
                        inter_rel_id = f"rel-inter-{uuid.uuid4().hex[:8]}"
                        inter_prov = json.dumps({
                            "source_message_id": message.message_id,
                            "first_seen": message.timestamp,
                            "last_seen": message.timestamp,
                            "relationship_type": "USES",
                            "raw_hash": message.raw_hash
                        })
                        cur.execute(
                            """
                            INSERT INTO Relationship (id, sourceId, targetId, type, confidence, evidenceCount, provenance, createdAt)
                            VALUES (?, ?, ?, 'USES', 0.90, 1, ?, ?)
                            """,
                            (inter_rel_id, h[0], w[0], inter_prov, now_iso)
                        )
                        persisted_relationship_ids.append(inter_rel_id)

            # 4. Create Evidence Record
            evidence_id = f"evi-tg-{uuid.uuid4().hex[:8]}"
            evidence_desc = json.dumps({
                "source_id": message.source_id,
                "message_id": message.message_id,
                "telegram_message_id": message.telegram_message_id,
                "content_hash": message.raw_hash,
                "collection_timestamp": message.timestamp,
                "processing_timestamp": now_iso,
                "source_url": message.message_url,
                "snippet": message.text[:240],
                "iocs_found": [i.entity for i in iocs[:5]]
            })
            cur.execute(
                """
                INSERT INTO Evidence (id, type, source, description, confidence, entityId, createdAt)
                VALUES (?, 'TELEGRAM_OSINT_MESSAGE', ?, ?, ?, ?, ?)
                """,
                (
                    evidence_id,
                    f"TELEGRAM_PUBLIC:{message.source_id}",
                    evidence_desc,
                    risk_score.total_score / 100.0,
                    source_entity_id,
                    now_iso
                )
            )

            # 5. Create Alert Record for High/Critical Risk Leads
            if risk_score.risk_level in ("CRITICAL", "HIGH"):
                alert_id = f"alt-tg-{uuid.uuid4().hex[:8]}"
                severity = "CRITICAL" if risk_score.risk_level == "CRITICAL" else "WARNING"
                title = f"OSINT Lead: Potential Threat Indicators in @{message.source_id}"
                desc = (
                    f"{risk_score.summary_rationale} | "
                    f"Provenance Hash: {message.raw_hash[:16]}... | "
                    f"{risk_score.disclaimer}"
                )
                cur.execute(
                    """
                    INSERT INTO Alert (id, type, severity, title, description, status, entityId, createdAt)
                    VALUES (?, 'OSINT_THREAT_DETECTION', ?, ?, ?, 'UNREAD', ?, ?)
                    """,
                    (alert_id, severity, title, desc, source_entity_id, now_iso)
                )
                created_alert_id = alert_id

            # 6. Create ActivityEvent Record
            event_id = f"evt-tg-{uuid.uuid4().hex[:8]}"
            details_json = json.dumps({
                "message_id": message.message_id,
                "telegram_message_id": message.telegram_message_id,
                "url": message.message_url,
                "iocs_count": len(iocs),
                "risk_score": risk_score.total_score,
                "risk_level": risk_score.risk_level
            })
            cur.execute(
                """
                INSERT INTO ActivityEvent (id, entityId, type, timestamp, details, source)
                VALUES (?, ?, 'MESSAGE', ?, ?, 'TELEGRAM_OSINT')
                """,
                (event_id, source_entity_id, now_iso, details_json)
            )

            conn.commit()

        return {
            "source_entity_id": source_entity_id,
            "entity_ids": persisted_entity_ids,
            "relationship_ids": persisted_relationship_ids,
            "alert_id": created_alert_id,
            "evidence_id": evidence_id
        }
