"""
IOC and Entity Extractor for Telegram OSINT
Structured around generic defensive threat-intelligence indicator classes:
CONTENT_INDICATOR, PAYMENT_INDICATOR, PUBLIC_HANDLE, URL, EMAIL, PHONE, LOCATION, QUANTITY, IDENTIFIER.
"""

import re
from typing import List, Dict, Any, Tuple
from .models import ExtractedIOC, NormalizedTelegramMessage
from .config import THREAT_KEYWORDS


class TelegramIOCExtractor:
    """
    Extracts structured threat-intelligence indicators and metadata offsets
    from normalized Telegram messages.
    """

    # Synthetic placeholder & indicator regexes
    REGEX_PAYMENT_INDICATOR = re.compile(
        r"\b(bc1[a-zA-HJ-NP-Z0-9]{25,62}|[13][a-km-zA-HJ-NP-Z1-9]{25,34}|0x[a-fA-F0-9]{40}|4[0-9AB][1-9A-HJ-NP-Za-km-z]{93}|T[A-Za-z1-9]{33}|PAYMENT_INDICATOR_[A-Z0-9_]+|CRYPTO_ADDRESS_EXAMPLE_[A-Z0-9_]+)\b"
    )

    REGEX_PUBLIC_HANDLE = re.compile(
        r"(?:^|(?<=\s))@([a-zA-Z0-9_]{4,32})\b|\b(PUBLIC_HANDLE_[A-Z0-9_]+|COMM_HANDLE_[A-Z0-9_]+)\b"
    )

    REGEX_COMM_IDENTIFIER = re.compile(
        r"\b(?:wickr|session|signal)[:\s@]+([a-zA-Z0-9_]{3,66})\b|\b(05[0-9a-fA-F]{64})\b|\b(IDENTIFIER_[A-Z0-9_]+)\b",
        re.IGNORECASE
    )

    REGEX_EMAIL = re.compile(
        r"\b([a-zA-Z0-9_.+-]+@(?:protonmail\.com|proton\.me|tutanota\.com|cock\.li|[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+))\b|\b(EMAIL_EXAMPLE_[A-Z0-9_]+)\b",
        re.IGNORECASE
    )

    REGEX_PHONE = re.compile(
        r"(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b|\b\+?[1-9]\d{1,2}[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b|\b(PHONE_EXAMPLE_[A-Z0-9_]+)\b"
    )

    REGEX_URL = re.compile(
        r"\b(https?://[^\s/$.?#].[^\s]*|[a-z0-9-]+\.onion\b|t\.me/[a-zA-Z0-9_+/]+|URL_EXAMPLE_[A-Z0-9_]+)\b",
        re.IGNORECASE
    )

    REGEX_QUANTITY = re.compile(
        r"\b(\d+(?:\.\d+)?)\s*(?:g|grams?|kg|kilos?|mg|oz|units?|lots?|packets?|batches?|bundles?)\b|\b(QUANTITY_FLAG_[A-Z0-9_]+)\b",
        re.IGNORECASE
    )

    REGEX_LOCATION = re.compile(
        r"\b(TRANSIT_CORRIDOR_[A-Z0-9_]+|BORDER_TRANSIT_[A-Z0-9_]+|REGION_[A-Z0-9_]+|LOCATION_EXAMPLE_[A-Z0-9_]+|punjab|chandigarh|mohali|delhi|mumbai|goa)\b",
        re.IGNORECASE
    )

    @classmethod
    def extract_all(cls, message: NormalizedTelegramMessage) -> List[ExtractedIOC]:
        raw_text = message.text
        text_lower = raw_text.lower()
        msg_id = message.message_id
        extracted: List[ExtractedIOC] = []
        seen_keys = set()

        def add_ioc(entity: str, entity_type: str, offset: int, confidence: float, category: str, snippet: str):
            clean_entity = entity.strip()
            if not clean_entity:
                return
            dedup_key = (entity_type, clean_entity.lower())
            if dedup_key in seen_keys:
                return
            seen_keys.add(dedup_key)
            extracted.append(ExtractedIOC(
                entity=clean_entity,
                entity_type=entity_type,
                source_message_id=msg_id,
                text_offset=max(0, offset),
                confidence=round(confidence, 2),
                category=category,
                context_snippet=snippet[:160]
            ))

        def get_snippet(start: int, end: int) -> str:
            s = max(0, start - 25)
            e = min(len(raw_text), end + 25)
            return raw_text[s:e].strip()

        # 1. Content Threat Keywords (CONTENT_INDICATOR)
        for cat_name, kw_list in THREAT_KEYWORDS.items():
            for kw in kw_list:
                pattern = rf"\b{re.escape(kw.lower())}\b"
                for match in re.finditer(pattern, text_lower):
                    start, end = match.span()
                    actual = raw_text[start:end]
                    add_ioc(
                        entity=actual,
                        entity_type="CONTENT_INDICATOR",
                        offset=start,
                        confidence=0.92,
                        category=cat_name,
                        snippet=get_snippet(start, end)
                    )

        # 2. Payment Indicators (PAYMENT_INDICATOR)
        for match in cls.REGEX_PAYMENT_INDICATOR.finditer(raw_text):
            add_ioc(match.group(0), "PAYMENT_INDICATOR", match.start(), 0.95, "FINANCIAL_SETTLEMENT", get_snippet(*match.span()))

        # 3. Public Handles (PUBLIC_HANDLE)
        for match in cls.REGEX_PUBLIC_HANDLE.finditer(raw_text):
            val = match.group(1) or match.group(2)
            if val:
                handle_str = f"@{val}" if not val.startswith("@") and not val.startswith("PUBLIC_HANDLE") else val
                add_ioc(handle_str, "PUBLIC_HANDLE", match.start(), 0.94, "PUBLIC_PROFILE", get_snippet(*match.span()))

        # 4. Off-Platform / Communication Identifiers (IDENTIFIER)
        for match in cls.REGEX_COMM_IDENTIFIER.finditer(raw_text):
            val = match.group(1) or match.group(2) or match.group(3)
            if val:
                add_ioc(val, "IDENTIFIER", match.start(), 0.95, "COMMUNICATION_HANDLE", get_snippet(*match.span()))

        # 5. URLs (URL)
        for match in cls.REGEX_URL.finditer(raw_text):
            url_str = match.group(0)
            if not url_str.startswith("@"):
                add_ioc(url_str, "URL", match.start(), 0.95, "NETWORK_LOCATION", get_snippet(*match.span()))

        # 6. Emails (EMAIL)
        for match in cls.REGEX_EMAIL.finditer(raw_text):
            val = match.group(1) or match.group(2)
            if val:
                add_ioc(val, "EMAIL", match.start(), 0.95, "ELECTRONIC_MAIL", get_snippet(*match.span()))

        # 7. Phone Numbers (PHONE)
        for match in cls.REGEX_PHONE.finditer(raw_text):
            val = match.group(0).strip()
            add_ioc(val, "PHONE", match.start(), 0.90, "TELECOMMUNICATION", get_snippet(*match.span()))

        # 8. Quantities (QUANTITY)
        for match in cls.REGEX_QUANTITY.finditer(raw_text):
            add_ioc(match.group(0), "QUANTITY", match.start(), 0.88, "BATCH_METRIC", get_snippet(*match.span()))

        # 9. Locations (LOCATION)
        for match in cls.REGEX_LOCATION.finditer(raw_text):
            add_ioc(match.group(0).title(), "LOCATION", match.start(), 0.85, "GEOGRAPHIC_INDICATOR", get_snippet(*match.span()))

        return extracted
