# pineSAW Scraper & Ingestion Microservices

This directory contains standalone crawler microservices for automated intelligence collection across the Darknet (Tor .onion) and Encrypted Messaging Platforms (Telegram).

---

## 📂 Microservices Overview

### 1. Tor Darknet Hidden Service Crawler (`tor_scraper.mjs`)
- **Protocol:** SOCKS5 Proxy routing via local Tor Daemon (`127.0.0.1:9050`).
- **Target Environments:** Darknet Marketplaces (GenesisMarket, AlphaBay, Torrez mirrors).
- **Function:** Crawls `.onion` drug listings, extracts raw HTML/text, bypasses bot-protections, and sends payloads to `POST /api/ingest/parse`.
- **Run Command:**
  ```bash
  npm run crawl:tor
  ```

---

### 2. Telegram Channel & Group Monitor (`telegram_scraper.mjs`)
- **Protocol:** MTProto / Telegram API Client.
- **Target Environments:** Public & invite-only dead-drop channels, dark-pharmacy networks.
- **Function:** Listens for keywords (slang terms, crypto addresses), captures message metadata, and live-streams intercepted messages into pineSAW.
- **Run Command:**
  ```bash
  npm run crawl:tg
  ```

---

## 🔗 Ingestion Pipeline Integration
All crawlers output structured JSON payloads directly to:
```http
POST http://localhost:3000/api/ingest/parse
Content-Type: application/json

{
  "text": "RAW_INTERCEPTED_TEXT",
  "autoIngest": true
}
```
The pineSAW backend automatically executes **Cambridge iCrime NLP extraction**, **Stanford SNAP address clustering**, and updates the SQLite knowledge graph in real time.
