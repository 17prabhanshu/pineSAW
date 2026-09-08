"""
Configuration and Threat Keyword Taxonomy for Telegram OSINT Service.
Configured for defensive threat-intelligence analysis and public-source monitoring.
"""

import os
from typing import Dict, List, Set

# Credentials via Environment Variables (Never Hardcoded)
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_API_ID = os.getenv("TELEGRAM_API_ID", "")
TELEGRAM_API_HASH = os.getenv("TELEGRAM_API_HASH", "")

# Admin User IDs authorized to execute operational bot commands
ADMIN_USER_IDS: Set[str] = set(
    filter(None, [uid.strip() for uid in os.getenv("ADMIN_USER_IDS", "admin,investigator_1,system,admin_user").split(",")])
)

# Operational Storage Paths
STORAGE_DIR = os.path.join(os.path.dirname(__file__), "storage")
os.makedirs(STORAGE_DIR, exist_ok=True)
CHECKPOINTS_FILE = os.path.join(STORAGE_DIR, "checkpoints.json")
SOURCES_REGISTRY_FILE = os.path.join(STORAGE_DIR, "sources_registry.json")

# Concurrency & Rate Limiting Controls
MAX_CONCURRENT_COLLECTORS = int(os.getenv("TG_MAX_WORKERS", "3"))
REQUEST_DELAY_SECONDS = float(os.getenv("TG_REQUEST_DELAY", "1.5"))
MAX_RETRIES = int(os.getenv("TG_MAX_RETRIES", "3"))
EXPONENTIAL_BACKOFF_BASE = float(os.getenv("TG_BACKOFF_BASE", "2.0"))

# Threat-Intelligence Categories & Indicators
THREAT_KEYWORDS: Dict[str, List[str]] = {
    "HIGH_RISK_CONTENT": [
        "THREAT_TERM_A", "THREAT_TERM_B", "THREAT_TERM_C",
        "narcotics", "synthetic_opioid", "contraband", "chemical_precursor",
        "controlled_substance", "illicit_compound", "adulterant"
    ],
    "SUSPICIOUS_PAYMENT_INDICATOR": [
        "PAYMENT_INDICATOR_A", "PAYMENT_INDICATOR_B",
        "monero", "xmr", "bitcoin", "btc", "usdt", "escrow", "crypto_transfer"
    ],
    "COMMUNICATION_INDICATOR": [
        "COMM_HANDLE_A", "COMM_HANDLE_B",
        "wickr", "session_id", "signal_contact", "protonmail", "tutanota"
    ],
    "QUANTITY_INDICATOR": [
        "QUANTITY_FLAG_A", "bulk_shipment", "sample_batch", "kilogram_lot", "packet_bundle"
    ],
    "LOCATION_INDICATOR": [
        "TRANSIT_CORRIDOR_ALPHA", "BORDER_TRANSIT_BETA", "REGION_DELHI_NCR", "REGION_PUNJAB"
    ]
}

def get_flat_threat_keywords() -> List[str]:
    """Returns deduplicated flat list of threat keywords."""
    keywords = set()
    for cat_keywords in THREAT_KEYWORDS.values():
        keywords.update(cat_keywords)
    return sorted(list(keywords))

def is_authorized_admin(user_id: str) -> bool:
    """Checks if a user ID belongs to an authorized administrator."""
    if not user_id:
        return False
    clean_id = str(user_id).strip()
    return clean_id in ADMIN_USER_IDS
