"""
Message Normalizer and SHA-256 Provenance Hasher for Telegram OSINT
"""

import hashlib
import re
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from .models import NormalizedTelegramMessage


class TelegramMessageNormalizer:
    """
    Normalizes raw message payloads into canonical NormalizedTelegramMessage
    and computes deterministic SHA-256 provenance hashes.
    """

    @staticmethod
    def normalize(raw: Dict[str, Any], default_source: str = "unknown") -> NormalizedTelegramMessage:
        source_id = str(raw.get("source_id") or raw.get("channel_username") or default_source).lstrip("@").strip()
        telegram_message_id = int(raw.get("telegram_message_id") or raw.get("message_id") or 0)
        
        # Clean text
        text = str(raw.get("text") or raw.get("raw_text") or "").strip()
        
        # Extract author
        author_public_username = raw.get("author_public_username") or raw.get("author_username")
        if author_public_username:
            author_public_username = author_public_username.lstrip("@").strip()
            
        author_public_id = raw.get("author_public_id")
        
        # Timestamps
        timestamp = raw.get("timestamp") or datetime.now(timezone.utc).isoformat()
        edit_timestamp = raw.get("edit_timestamp")
        
        # Media indicators
        media_type = raw.get("media_type")
        if not media_type:
            media_list = raw.get("media_indicators") or []
            media_type = media_list[0] if media_list else "NONE"
            
        message_url = raw.get("message_url") or f"https://t.me/{source_id}/{telegram_message_id}"
        discovered_at = raw.get("discovered_at") or datetime.now(timezone.utc).isoformat()
        reply_to = raw.get("reply_to") or raw.get("reply_to_msg_id")

        return NormalizedTelegramMessage.create(
            source_id=source_id,
            telegram_message_id=telegram_message_id,
            text=text,
            author_public_id=author_public_id,
            author_public_username=author_public_username,
            timestamp=timestamp,
            edit_timestamp=edit_timestamp,
            reply_to=int(reply_to) if reply_to else None,
            media_type=media_type,
            message_url=message_url,
            discovered_at=discovered_at
        )

    @staticmethod
    def compute_sha256(text: str, source_id: str, message_id: int) -> str:
        """Helper to verify or recalculate content provenance hash."""
        payload = f"{source_id.lstrip('@').strip()}:{message_id}:{text}".encode("utf-8")
        return hashlib.sha256(payload).hexdigest()
