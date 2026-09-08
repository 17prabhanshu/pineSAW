"""
Data Models for Telegram OSINT Bot Service
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import hashlib
from datetime import datetime, timezone

STANDARD_DISCLAIMER = (
    "Investigative Lead — Requires Human Review.\n"
    "The score is an analytical indicator and is not a determination of criminal activity."
)


class NormalizedTelegramMessage(BaseModel):
    message_id: str
    source_id: str
    telegram_message_id: int
    author_public_id: Optional[str] = None
    author_public_username: Optional[str] = None
    text: str
    timestamp: str
    edit_timestamp: Optional[str] = None
    reply_to: Optional[int] = None
    media_type: Optional[str] = None  # "PHOTO", "VIDEO", "DOCUMENT", "NONE"
    message_url: str
    discovered_at: str
    raw_hash: str  # SHA-256 integrity hash

    @classmethod
    def create(
        cls,
        source_id: str,
        telegram_message_id: int,
        text: str,
        author_public_id: Optional[str] = None,
        author_public_username: Optional[str] = None,
        timestamp: Optional[str] = None,
        edit_timestamp: Optional[str] = None,
        reply_to: Optional[int] = None,
        media_type: Optional[str] = None,
        message_url: Optional[str] = None,
        discovered_at: Optional[str] = None,
    ) -> "NormalizedTelegramMessage":
        clean_source = source_id.lstrip("@").strip()
        msg_id = f"tg-{clean_source}-{telegram_message_id}"
        
        # Provenance SHA-256 hash computed over source, msg ID, and text
        hash_payload = f"{clean_source}:{telegram_message_id}:{text}".encode("utf-8")
        raw_hash = hashlib.sha256(hash_payload).hexdigest()
        
        now_iso = datetime.now(timezone.utc).isoformat()
        ts = timestamp or now_iso
        disc = discovered_at or now_iso
        url = message_url or f"https://t.me/{clean_source}/{telegram_message_id}"
        
        return cls(
            message_id=msg_id,
            source_id=clean_source,
            telegram_message_id=telegram_message_id,
            author_public_id=author_public_id,
            author_public_username=author_public_username,
            text=text,
            timestamp=ts,
            edit_timestamp=edit_timestamp,
            reply_to=reply_to,
            media_type=media_type or "NONE",
            message_url=url,
            discovered_at=disc,
            raw_hash=raw_hash,
        )


class ExtractedIOC(BaseModel):
    entity: str
    entity_type: str  # "CONTENT_INDICATOR", "PAYMENT_INDICATOR", "PUBLIC_HANDLE", "URL", "EMAIL", "PHONE", "LOCATION", "QUANTITY", "IDENTIFIER"
    source_message_id: str
    text_offset: int = 0
    confidence: float = 1.0
    category: Optional[str] = None
    context_snippet: str = ""


class RiskFactorLineItem(BaseModel):
    factor_name: str
    category: str
    points: float
    evidence_text: str
    confidence: float = 1.0


class ExplainableRiskScore(BaseModel):
    total_score: float  # 0 to 100
    risk_level: str  # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    line_item_breakdown: List[RiskFactorLineItem] = Field(default_factory=list)
    dominant_flags: List[str] = Field(default_factory=list)
    summary_rationale: str = ""
    disclaimer: str = STANDARD_DISCLAIMER


class PublicTelegramSource(BaseModel):
    source_id: str
    channel_username: str
    title: str = ""
    description: str = ""
    verified_public: bool = True
    status: str = "MONITORED"  # "MONITORED", "DISCOVERED", "RATE_LIMITED", "ARCHIVED"
    discovered_via_keyword: Optional[str] = None
    subscriber_count: Optional[int] = None
    last_checked: Optional[str] = None
    last_message_id: int = 0
    total_messages_collected: int = 0


class BotStatus(BaseModel):
    sources_discovered: int = 0
    sources_monitored: int = 0
    messages_collected: int = 0
    new_messages: int = 0
    iocs_extracted: int = 0
    high_risk_leads: int = 0
    last_checkpoint: str = "None"
    is_running: bool = False
    mode: str = "STANDBY"  # "STANDBY", "LIVE", "MOCK"
