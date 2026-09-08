"""
Tactical CTI presets for Telegram OSINT service.
Direct parity with pineSAW tactical investigations (e.g. North India / Chandigarh corridor).
Contains realistic tactical intercepts with IOCs (BTC/ETH/XMR addresses, Session IDs, Wickr handles, PGP, darknet .onion).
"""

from typing import Dict, List, Any
from datetime import datetime, timezone, timedelta

def get_cti_presets() -> Dict[str, List[Dict[str, Any]]]:
    now = datetime.now(timezone.utc)
    return {
        "tri_city_dead_drops": [
            {
                "id": "tg-chd-001",
                "channel": "@tri_city_dead_drops",
                "sender": "ShadowBroker (ID: 84920194)",
                "timestamp": (now - timedelta(minutes=4)).isoformat(),
                "text": "FRESH STOCK ALERT // CHANDIGARH: 250 pills of dirty 30s (fentanyl m30) and 50g of ice crystal shards ready for drop in Sector 35. Price: 0.05 BTC. Pay to bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq or USDT/ETH 0x742d35Cc6634C0532925a3b844Bc454e4438f44e. Direct message @shadow_broker_t.",
                "views": "1,420",
                "media_type": "PHOTO"
            },
            {
                "id": "tg-chd-002",
                "channel": "@tri_city_dead_drops",
                "sender": "KiteRunner (ID: 99182736)",
                "timestamp": (now - timedelta(minutes=18)).isoformat(),
                "text": "Bulk pharma supply: 1000 bars of xannies (Alprazolam 2mg) vacuum sealed foil. No fiat cash accepted. ETH off-ramp only: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e. Verification via protonmail shadow99@proton.me.",
                "views": "890",
                "media_type": "NONE"
            },
            {
                "id": "tg-chd-003",
                "channel": "@tri_city_dead_drops",
                "sender": "ApexDistro (ID: 41029811)",
                "timestamp": (now - timedelta(minutes=42)).isoformat(),
                "text": "SECTOR 22 DEAD DROP CONFIRMED: Geo-coordinates encrypted via PGP key 4A81 B892. Package contains 200g high-grade chitta brown sugar & 500 ecstasy tabs (molly/MDMA). Released upon multisig verification. Monero XMR: 42BAaWb2G1t5J7nL9qXmR8yP3zV6wK1sC4vB7nM9pQ2rT5vX8zL1kM3nQ6pS9wV2yB5nC8mP1rT4wX7zL9. Contact session: 05ab12cd34ef56ab12cd34ef56ab12cd34ef56ab12cd34ef56ab12cd34ef56ab.",
                "views": "2,130",
                "media_type": "DOCUMENT"
            },
            {
                "id": "tg-chd-004",
                "channel": "@tri_city_dead_drops",
                "sender": "NorthCorridor_Runner",
                "timestamp": (now - timedelta(minutes=75)).isoformat(),
                "text": "MOHALI PHASE 7 CONSIGNMENT: 50 bottles of purple drank lean (Codeine syrup) & 100 boxes Percocet 10mg. Unmarked delivery van drop. PGP encrypted manifest attached. Settlement via BTC: bc1q5shngj24323vrmqhjgxzpp8e5aq6xvfqvnrfc4. Telegram admin: @tri_city_dispatch.",
                "views": "1,780",
                "media_type": "PHOTO"
            },
            {
                "id": "tg-chd-005",
                "channel": "@tri_city_dead_drops",
                "sender": "StealthPack_India",
                "timestamp": (now - timedelta(minutes=110)).isoformat(),
                "text": "Stealth packaging update: All consignments moving through Zirakpur highway hub now sealed in triple mylar barrier with carbon paper lining to defeat X-ray and K9 detection. Domestic speed post only, no signature required. Signal inquiries: signal.me/#p/stealth_ops.",
                "views": "3,400",
                "media_type": "NONE"
            },
            {
                "id": "tg-chd-006",
                "channel": "@tri_city_dead_drops",
                "sender": "ShadowBroker (ID: 84920194)",
                "timestamp": (now - timedelta(minutes=160)).isoformat(),
                "text": "ESCROW NOTICE: 1.5 BTC deposited for Panchkula bulk shipment of 10,000 pressed M30 fent pills. Tor escrow service agoraer2jlvd4fve.onion operational. Release triggered upon dead drop pin verification.",
                "views": "2,890",
                "media_type": "DOCUMENT"
            }
        ],
        "shadow_escrow_chd": [
            {
                "id": "tg-esc-001",
                "channel": "@shadow_escrow_chd",
                "sender": "EscrowBot_Admin (ID: 10482910)",
                "timestamp": (now - timedelta(minutes=6)).isoformat(),
                "text": "AUTOMATED ESCROW RELEASE #8821: Buyer confirmed receipt of 500g Ketamine crystal in Sector 17 nodal drop. Releasing 0.84 BTC to seller vendor wallet bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq. PGP verification: 4A81 B892 018C EFE1. Hidden service: agoraer2jlvd4fve.onion.",
                "views": "3,110",
                "media_type": "NONE"
            },
            {
                "id": "tg-esc-002",
                "channel": "@shadow_escrow_chd",
                "sender": "PunjabHawala_Operator",
                "timestamp": (now - timedelta(minutes=38)).isoformat(),
                "text": "Fiat-to-crypto liquidity swap active. RTGS transfers initiated to State Bank mule accounts. Immediate cash pickup available in Mohali Sector 70. Contact @shadow_broker_t for PMLA tier-1 clearance.",
                "views": "2,450",
                "media_type": "NONE"
            },
            {
                "id": "tg-esc-003",
                "channel": "@shadow_escrow_chd",
                "sender": "Laundromat_Node_04",
                "timestamp": (now - timedelta(minutes=95)).isoformat(),
                "text": "Whirlpool CoinJoin mix completed: 14.8 BTC routed through 18 peeling transactions to unhosted wallets. Wasabi pool hop latency: 12ms. Intercept flags suppressed. Destination address: 0x8589427373D6D84E98730D7795D8f6f8731FDA16.",
                "views": "1,980",
                "media_type": "NONE"
            }
        ],
        "dark_pharm_reup": [
            {
                "id": "tg-pharma-001",
                "channel": "@dark_pharm_reup",
                "sender": "PharmaDirect_Wholesale",
                "timestamp": (now - timedelta(minutes=18)).isoformat(),
                "text": "Restock announcement: 50,000 pressed blue M30 tablets with lab-verified fentanyl citrate. Guaranteed stealth packaging double-vacuumed with carbon wrap. Tor mirror: agoraer2jlvd4fve.onion. Inquiries to @tri_city_dead_drops or Wickr: v_xpress_deals.",
                "views": "5,820",
                "media_type": "PHOTO"
            },
            {
                "id": "tg-pharma-002",
                "channel": "@dark_pharm_reup",
                "sender": "GlobalSynthetics_HQ",
                "timestamp": (now - timedelta(minutes=80)).isoformat(),
                "text": "New designer catalog: Synthetic Cathinones (4-MMC / Mephedrone) 99.4% purity and 2C-B pressed pills. Shipments dispatched in retail electronics packaging with counterfeit invoices. Monero & BTC accepted.",
                "views": "4,120",
                "media_type": "NONE"
            }
        ]
    }
