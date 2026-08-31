"""
pineSAW Intelligence & Entity Extraction Engine (AI Brain)
----------------------------------------------------------
Implements high-speed regex IOC parsers alongside GLiNER (Generalist Named Entity Recognition)
for zero-shot extraction of contraband, vendors, aliases, cryptocurrency addresses, and PGP blocks.
"""

import re
import hashlib
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import io
from PIL import Image
import imagehash


class ExtractedCryptoAddress(BaseModel):
    network: str  # BITCOIN, MONERO, ETHEREUM
    address_type: str  # BECH32_SEGWIT, TAPROOT, LEGACY_P2PKH, MONERO_STANDARD, ETH_HEX
    address: str
    confidence: float = 1.0


class ExtractedCommunicationHandle(BaseModel):
    platform: str  # TELEGRAM, PROTONMAIL, SESSION, TOX, WICKR
    handle: str
    confidence: float = 0.95


class ExtractedContrabandItem(BaseModel):
    substance: str
    slang_name: Optional[str] = None
    quantity: Optional[str] = None
    price_claim: Optional[str] = None
    confidence: float = 0.92


class ExtractedIntelligenceArtifact(BaseModel):
    artifact_id: str
    source_url: str
    vendor_alias: Optional[str] = None
    marketplace: Optional[str] = None
    contraband: List[ExtractedContrabandItem] = Field(default_factory=list)
    crypto_wallets: List[ExtractedCryptoAddress] = Field(default_factory=list)
    contact_handles: List[ExtractedCommunicationHandle] = Field(default_factory=list)
    pgp_fingerprints: List[str] = Field(default_factory=list)
    pgp_blocks: List[str] = Field(default_factory=list)
    image_phashes: List[str] = Field(default_factory=list)
    threat_tier: str = "MEDIUM"


class HighSpeedEntityExtractor:
    # --------------------------------------------------------------------------
    # REGEX PATTERN COMPILATION FOR HIGH-SPEED VECTORIZED EXTRACTION
    # --------------------------------------------------------------------------
    # Bitcoin: Legacy (1), P2SH (3), SegWit Bech32 (bc1q), Taproot (bc1p)
    BTC_REGEX = re.compile(r'\b(bc1[p|q][a-zA-HJ-NP-Z0-9]{38,58}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})\b')

    # Monero: Standard (4...) 95 chars, Integrated (8...) 106 chars
    XMR_REGEX = re.compile(r'\b([48][0-9AB][1-9A-HJ-NP-Za-km-z]{93}|[48][0-9AB][1-9A-HJ-NP-Za-km-z]{104})\b')

    # Ethereum: 0x + 40 hex chars
    ETH_REGEX = re.compile(r'\b(0x[a-fA-F0-9]{40})\b')

    # Communication Vectors
    TG_REGEX = re.compile(r'(?:t\.me\/|@)([a-zA-Z0-9_]{5,32})\b')
    EMAIL_REGEX = re.compile(r'\b([a-zA-Z0-9_.+-]+@(?:proton(?:mail)?|tutanota|cock|onionmail)\.(?:me|com|ch|io))\b', re.IGNORECASE)
    SESSION_ID_REGEX = re.compile(r'\b(05[a-fA-F0-9]{64})\b')
    TOX_ID_REGEX = re.compile(r'\b([a-fA-F0-9]{76})\b')

    # PGP Public Key Blocks
    PGP_REGEX = re.compile(r'-----BEGIN PGP PUBLIC KEY BLOCK-----[\s\S]*?-----END PGP PUBLIC KEY BLOCK-----')

    # Common Darknet Drug Slang Lexicon
    SLANG_LEXICON = {
        "m30": "Fentanyl (Counterfeit Oxycodone)",
        "dirty 30s": "Fentanyl Pressed Tablets",
        "fent": "Fentanyl",
        "china white": "High-Purity Heroin / Fentanyl Analogue",
        "ice": "Methamphetamine Crystal",
        "glass": "Methamphetamine",
        "shards": "Methamphetamine",
        "xannies": "Alprazolam / Xanax",
        "bars": "Alprazolam 2mg Tablets",
        "afghan kush": "Cannabis Indica / Hashish",
        "mdma rock": "MDMA Crystal",
        "ketamine": "Ketamine HCL",
        "k-hole": "Ketamine"
    }

    def __init__(self, use_gliner: bool = False):
        self.gliner_model = None
        if use_gliner:
            try:
                from gliner import GLiNER
                self.gliner_model = GLiNER.from_pretrained("urchade/gliner_base")
            except Exception as e:
                print(f"[!] GLiNER model initialization fallback to lexicon parsing: {e}")

    def extract_cryptocurrency(self, text: str) -> List[ExtractedCryptoAddress]:
        """Extract and classify Bitcoin, Monero, and Ethereum addresses."""
        results = []

        # Bitcoin
        for match in self.BTC_REGEX.findall(text):
            addr_type = "BECH32_SEGWIT" if match.startswith("bc1q") else (
                "TAPROOT" if match.startswith("bc1p") else (
                    "P2SH" if match.startswith("3") else "LEGACY_P2PKH"
                )
            )
            results.append(ExtractedCryptoAddress(network="BITCOIN", address_type=addr_type, address=match))

        # Monero
        for match in self.XMR_REGEX.findall(text):
            addr_type = "MONERO_INTEGRATED" if match.startswith("8") else "MONERO_STANDARD"
            results.append(ExtractedCryptoAddress(network="MONERO", address_type=addr_type, address=match))

        # Ethereum
        for match in self.ETH_REGEX.findall(text):
            results.append(ExtractedCryptoAddress(network="ETHEREUM", address_type="ETH_HEX", address=match))

        # Deduplicate
        unique = {w.address: w for w in results}
        return list(unique.values())

    def extract_communication_handles(self, text: str) -> List[ExtractedCommunicationHandle]:
        """Extract Telegram handles, privacy emails, Session IDs, and Tox IDs."""
        handles = []

        for tg in self.TG_REGEX.findall(text):
            handles.append(ExtractedCommunicationHandle(platform="TELEGRAM", handle=f"@{tg}"))

        for email in self.EMAIL_REGEX.findall(text):
            handles.append(ExtractedCommunicationHandle(platform="PROTONMAIL", handle=email))

        for session in self.SESSION_ID_REGEX.findall(text):
            handles.append(ExtractedCommunicationHandle(platform="SESSION", handle=session))

        for tox in self.TOX_ID_REGEX.findall(text):
            handles.append(ExtractedCommunicationHandle(platform="TOX", handle=tox))

        unique = {h.handle: h for h in handles}
        return list(unique.values())

    def extract_pgp(self, text: str) -> Tuple[List[str], List[str]]:
        """Extract PGP public key blocks and calculate SHA-256 fingerprint representations."""
        blocks = self.PGP_REGEX.findall(text)
        fingerprints = []
        for block in blocks:
            # Generate deterministic fingerprint hash of the key block
            fp = hashlib.sha256(block.encode("utf-8")).hexdigest()[:16].upper()
            formatted_fp = " ".join(fp[i:i+4] for i in range(0, len(fp), 4))
            fingerprints.append(formatted_fp)
        return blocks, fingerprints

    def compute_image_phash(self, image_bytes: bytes) -> str:
        """Calculate Perceptual Hash (pHash) for cross-listing photo correlation."""
        try:
            image = Image.open(io.BytesIO(image_bytes))
            return str(imagehash.phash(image))
        except Exception:
            return ""

    def extract_entities_gliner_or_lexicon(self, text: str) -> List[ExtractedContrabandItem]:
        """Extract contraband entities using GLiNER zero-shot model or high-speed lexicon matcher."""
        items = []

        if self.gliner_model:
            labels = ["contraband substance", "narcotic drug", "quantity", "price"]
            entities = self.gliner_model.predict_entities(text, labels, threshold=0.45)
            for ent in entities:
                if ent["label"] in ["contraband substance", "narcotic drug"]:
                    items.append(ExtractedContrabandItem(substance=ent["text"], confidence=ent["score"]))
        else:
            # High-speed fallback lexicon parsing
            text_lower = text.lower()
            for slang, std_name in self.SLANG_LEXICON.items():
                if re.search(rf'\b{re.escape(slang)}\b', text_lower):
                    # Try to extract quantity nearby (e.g. 500 pills of dirty 30s)
                    qty_match = re.search(rf'(\d+(?:\.\d+)?\s*(?:g|grams?|kg|pills?|tabs?|caps?|oz))\s*(?:of\s*)?{re.escape(slang)}', text_lower)
                    qty = qty_match.group(1) if qty_match else None
                    items.append(ExtractedContrabandItem(
                        substance=std_name,
                        slang_name=slang,
                        quantity=qty,
                        confidence=0.94
                    ))

        return items

    def process_raw_dom(self, url: str, html_text: str, image_bytes_list: Optional[List[bytes]] = None) -> ExtractedIntelligenceArtifact:
        """Master parsing pipeline converting raw HTML/DOM into structured CTI intelligence artifact."""
        wallets = self.extract_cryptocurrency(html_text)
        handles = self.extract_communication_handles(html_text)
        pgp_blocks, pgp_fps = self.extract_pgp(html_text)
        contraband = self.extract_entities_gliner_or_lexicon(html_text)

        phashes = []
        if image_bytes_list:
            for img in image_bytes_list:
                ph = self.compute_image_phash(img)
                if ph:
                    phashes.append(ph)

        # Determine threat tier
        threat_tier = "LOW"
        if any("Fentanyl" in c.substance for c in contraband):
            threat_tier = "CRITICAL"
        elif contraband or wallets:
            threat_tier = "HIGH"
        elif handles:
            threat_tier = "MEDIUM"

        artifact_id = f"ART-{hashlib.sha256(url.encode()).hexdigest()[:12].upper()}"

        return ExtractedIntelligenceArtifact(
            artifact_id=artifact_id,
            source_url=url,
            marketplace="GenesisMarket Mirror" if "genesis" in url else "Darknet Market",
            contraband=contraband,
            crypto_wallets=wallets,
            contact_handles=handles,
            pgp_fingerprints=pgp_fps,
            pgp_blocks=pgp_blocks,
            image_phashes=phashes,
            threat_tier=threat_tier
        )


if __name__ == "__main__":
    sample_text = """
    VENDOR: ShadowBroker (GenesisMarket)
    NEW BATCH: Pure 500 pills of dirty 30s (m30 fent) and 100g of ice crystal available.
    BTC SegWit: bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq
    BTC Taproot: bc1p5d7rjq7g6rd2ee07rrjc9a6s98x5z0am25q5re8j6ctc309xhnqsc3w980
    Monero: 44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGeiSTGh3hfrf2KmFrU6qi8nUQLgB3TDA262NjNev
    Contact: @shadow_broker_t or shadow99@proton.me
    -----BEGIN PGP PUBLIC KEY BLOCK-----
    mQENBF4/4w8BCADL84920194...
    -----END PGP PUBLIC KEY BLOCK-----
    """
    extractor = HighSpeedEntityExtractor()
    artifact = extractor.process_raw_dom("http://genesis4xyt6z9a1.onion/listing/84920", sample_text)
    print(artifact.model_dump_json(indent=2))
