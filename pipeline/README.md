# pineSAW Distributed Ingestion & Threat Intelligence Pipeline

High-concurrency, horizontally scalable, event-driven OSINT and threat intelligence ingestion pipeline for Tor darknet marketplaces and encrypted messaging platforms.

---

## 🏗️ Architecture Stack

1. **Proxy Layer:** 4-instance Ephemeral Tor SOCKS5 fleet (`IsolateSOCKSAuth`) balanced through **HAProxy** (`tcp-check`).
2. **Scraper Layer:** Async **Playwright Stealth** crawler engine (`crawler_worker.py`) with Canvas/WebGL spoofing, randomized viewports, and Gaussian-distributed interval delays.
3. **Event Bus:** **Apache Kafka** (KRaft mode, zero ZooKeeper) topics:
   - `raw.darknet.dom`
   - `raw.telegram.events`
4. **AI & Extraction Engine:** **HighSpeedEntityExtractor** (`entity_extractor.py`) combining vectorized regex with GLiNER / spaCy zero-shot models and perceptual image hashing (`pHash`).
5. **Graph Layer:** **Neo4j / Memgraph** (`graph_ingestor.py`) consuming streaming intelligence and executing Cypher `MERGE` queries to construct the real-time identity resolution graph.

---

## 🚀 Quickstart

### 1. Launch Infrastructure
```bash
docker compose up -d
```
Services started:
- **HAProxy SOCKS5:** `localhost:9050` (Stats UI: `http://localhost:8404`)
- **Tor Daemons:** 4 isolated daemon instances
- **Apache Kafka:** `localhost:9092`
- **Neo4j Browser:** `http://localhost:7474` (Bolt: `localhost:7687`)

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
playwright install chromium
```

### 3. Start Graph Ingestion Consumer
```bash
python graph_ingestor.py
```

### 4. Run Crawler Worker
```bash
python crawler_worker.py
```
