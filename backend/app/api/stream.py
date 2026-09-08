import asyncio
import json
import random
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from datetime import datetime

stream_router = APIRouter()

TEMPLATES = [
    {
        "socket": "tcp://127.0.0.1:5556",
        "channel": "darknet.tor.bohemia.vendor",
        "source": "AIL Lacus Headless Crawler #1",
        "headline": "Encrypted PGP proof of reserve broadcasted by vendor 'ChemicalKing'",
        "iocs": [{"type": "VENDOR", "value": "ChemicalKing"}, {"type": "ONION", "value": "bohemiadark8x9a.onion"}],
        "rawHex": "41 49 4c 01 70 67 70 5f 70 72 6f 6f 66 5f 72 65 73 65 72 76 65",
        "rawJson": {"vendor": "ChemicalKing", "market": "Bohemia", "rating": "4.98/5", "listings_active": 84},
        "riskLevel": "HIGH"
    },
    {
        "socket": "tcp://127.0.0.1:5557",
        "channel": "darknet.telegram.c2.channel",
        "source": "AIL Telegram Telethon Ingestor",
        "headline": "Darknet marketplace mirror link published in channel @archetyp_backup",
        "iocs": [{"type": "TELEGRAM", "value": "@archetyp_backup"}, {"type": "MIRROR", "value": "archetypmirror4.onion"}],
        "rawHex": "54 47 5f 4d 49 52 52 4f 52 5f 50 4f 53 54 20 6f 6e 69 6f 6e",
        "rawJson": {"channel": "@archetyp_backup", "subscribers": 14820, "verified_admin_pgp": True},
        "riskLevel": "MEDIUM"
    },
    {
        "socket": "tcp://127.0.0.1:5558",
        "channel": "darknet.crypto.mempool.peeling",
        "source": "AIL ZeroMQ BTC FullNode Sub",
        "headline": "High-value peel detected: 8.42 BTC split into 12 unspent dust utxos",
        "iocs": [{"type": "BTC", "value": "bc1q84z9...09ea"}, {"type": "METHOD", "value": "CoinJoin Whirlpool"}],
        "rawHex": "02 00 00 00 04 89 f1 09 bc 1q 84 z9",
        "rawJson": {"amount_btc": 8.42, "utxos": 12, "flagged_under": "NDPS_SEC_68F"},
        "riskLevel": "CRITICAL"
    },
    {
        "socket": "tcp://127.0.0.1:5559",
        "channel": "darknet.pastebin.leak.credential",
        "source": "CIRCL AIL Paste Monitor",
        "headline": "Data Leak: 50,000+ Indian banking credentials (HDFC, SBI) detected in paste dump",
        "iocs": [{"type": "BIN", "value": "Pastebin"}, {"type": "BANK", "value": "HDFC/SBI"}],
        "rawHex": "43 49 52 43 4c 5f 50 41 53 54 45 5f 4c 45 41 4b",
        "rawJson": {"records": 52401, "country_target": "India", "password_hashes": "bcrypt/md5", "verified": True},
        "riskLevel": "CRITICAL"
    },
    {
        "socket": "tcp://127.0.0.1:5560",
        "channel": "darknet.tor.pgp.extracted",
        "source": "CIRCL AIL PGP Extractor Module",
        "headline": "New PGP Identity Cross-Match: Vendor 'ShadowBroker' key matches Telegram user",
        "iocs": [{"type": "PGP_FINGERPRINT", "value": "0x4A8B9C2D..."}, {"type": "TELEGRAM", "value": "@shadow_broker_t"}],
        "rawHex": "50 47 50 5f 43 52 4f 53 53 4d 41 54 43 48 5f 46 4f 55 4e 44",
        "rawJson": {"key_length": 4096, "creation_date": "2024-01-12", "match_confidence": 0.99, "linked_identities": 2},
        "riskLevel": "CRITICAL"
    },
    {
        "socket": "tcp://127.0.0.1:5561",
        "channel": "darknet.financial.cards.dump",
        "source": "CIRCL AIL CC Dumps Parser",
        "headline": "Joker's Stash Mirror Update: 2,500 fresh Track 2 Visa CVV dumps added",
        "iocs": [{"type": "CARDING", "value": "Visa/MC"}, {"type": "MARKET", "value": "Jokers Stash"}],
        "rawHex": "54 52 41 43 4b 32 5f 44 55 4d 50 5f 56 49 53 41",
        "rawJson": {"card_type": "Visa", "qty": 2500, "price_per_card": "$12", "avg_balance": "Unknown"},
        "riskLevel": "HIGH"
    }
]

async def zmq_event_generator():
    while True:
        await asyncio.sleep(random.uniform(2.0, 4.0))
        msg = random.choice(TEMPLATES).copy()
        msg["id"] = f"zmq-backend-{str(int(datetime.now().timestamp() * 1000))[-4:]}"
        now = datetime.now()
        msg["timestamp"] = f"{now.strftime('%H:%M:%S')}.{now.strftime('%f')[:3]}"
        
        # Real ZMQ connection would go here
        yield f"data: {json.dumps(msg)}\n\n"

@stream_router.get("/zmq_stream")
async def sse_zmq_stream():
    return StreamingResponse(zmq_event_generator(), media_type="text/event-stream")
