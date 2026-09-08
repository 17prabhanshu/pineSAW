# pineSAW Scraper & Ingestion Microservices

This directory contains standalone crawler microservices for automated intelligence collection across the Darknet (Tor .onion) and Encrypted Messaging Platforms (Telegram).

---

## ⚙️ Prerequisites

### 1. Install & Start Tor Daemon (required for dark web crawling)

```bash
# Install Tor via Homebrew
brew install tor

# Start the Tor daemon (SOCKS5 proxy on 127.0.0.1:9050)
brew services start tor

# Verify it's running
brew services list | grep tor
```

> **Note:** The Tor daemon must be running before you start `tor_scraper.mjs`. If Tor is not running, the crawler will print `SOCKS5 connection refused` errors.

### 2. Install npm dependencies

```bash
npm install --legacy-peer-deps
```

This installs `zeromq`, `socks-proxy-agent`, and `cheerio` along with all project deps.

---

## 📂 Microservices Overview

### 1. Tor Darknet Hidden Service Crawler (`tor_scraper.mjs`)

- **Protocol:** SOCKS5 proxy routing via local Tor daemon (`127.0.0.1:9050`) using `socks-proxy-agent`
- **Target Environments:** Real `.onion` dark web pages
- **Parser:** `cheerio` — extracts listing text, BTC/ETH/XMR wallet addresses, Telegram handles, PGP blocks, emails, and linked onion URLs
- **Output:** Publishes scraped events via **ZeroMQ PUB** socket on `tcp://*:5555`
- **Topic:** `darkweb`

```bash
npm run crawl:tor
```

**Environment variables:**
| Variable | Default | Description |
|---|---|---|
| `TOR_PROXY_HOST` | `127.0.0.1` | Tor SOCKS5 host |
| `TOR_PROXY_PORT` | `9050` | Tor SOCKS5 port |
| `ZMQ_PUB_ADDRESS` | `tcp://*:5555` | ZeroMQ PUB bind address |
| `CRAWL_DELAY_MS` | `2000` | Delay between requests (circuit rotation) |
| `ONION_TARGETS` | *(see source)* | Comma-separated list of `.onion` URLs to crawl |

---

### 2. ZeroMQ Ingest Bridge (`zmq_ingest_bridge.mjs`) ← **NEW**

- **Protocol:** ZeroMQ SUB socket — subscribes to events from `tor_scraper.mjs`
- **Topic:** `darkweb`
- **Function:** Receives scraped JSON payloads and forwards them to `POST /api/ingest/parse`
- **Must be started BEFORE `tor_scraper.mjs`**

```bash
npm run crawl:bridge
```

**Environment variables:**
| Variable | Default | Description |
|---|---|---|
| `ZMQ_SUB_ADDRESS` | `tcp://localhost:5555` | ZeroMQ PUB endpoint to connect to |
| `PINESAW_API` | `http://localhost:3000/api/ingest/parse` | pineSAW ingestion API URL |
| `ZMQ_TOPIC` | `darkweb` | Topic filter |

---

### 3. Telegram Channel & Group Monitor (`telegram_scraper.mjs`)

- **Protocol:** MTProto / Telegram API Client
- **Target Environments:** Public & invite-only dead-drop channels, dark-pharmacy networks
- **Function:** Listens for keywords (slang terms, crypto addresses), captures message metadata, and live-streams intercepted messages into pineSAW

```bash
npm run crawl:tg
```

---

## 🚀 Running the Full Dark Web Crawl Pipeline

Open **three terminals**:

```bash
# Terminal 1 — Start pineSAW dev server
npm run dev

# Terminal 2 — Start the ZeroMQ ingest bridge (subscriber)
npm run crawl:bridge

# Terminal 3 — Start the Tor crawler (publisher)
npm run crawl:tor
```

### Data flow:
```
Tor Daemon (127.0.0.1:9050)
        ↓ SOCKS5
tor_scraper.mjs  (fetches .onion pages, parses HTML)
        ↓ ZeroMQ PUB (tcp://*:5555, topic: "darkweb")
zmq_ingest_bridge.mjs  (ZeroMQ SUB)
        ↓ HTTP POST
POST /api/ingest/parse  (NLP extraction + graph update)
```

---

## 🔗 Ingestion API Schema

All crawlers ultimately send structured JSON payloads to:

```http
POST http://localhost:3000/api/ingest/parse
Content-Type: application/json

{
  "text": "RAW_EXTRACTED_TEXT",
  "source": "tor_crawler",
  "url": "http://example.onion/listing/123",
  "title": "Page Title",
  "listings": ["listing text 1", ...],
  "entities": {
    "btcAddresses": [...],
    "ethAddresses": [...],
    "xmrAddresses": [...],
    "telegramHandles": [...],
    "emails": [...],
    "pgpBlocks": [...],
    "linkedOnions": [...]
  },
  "autoIngest": true,
  "crawledAt": "2026-09-08T20:00:00.000Z"
}
```

The pineSAW backend executes **NLP extraction**, **address clustering**, and updates the SQLite knowledge graph in real time.
