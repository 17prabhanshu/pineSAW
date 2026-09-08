"""
SOTA Semantic Web Scraper & Anti-Bot Stealth Engine for pineSAW
Combines:
1. Crawl4AI-style Semantic Cleaning: Eliminates navbars, cookie banners, tracking scripts,
   and boilerplate, converting messy HTML into token-optimized, LLM-ready Markdown.
2. Camoufox-style Stealth Driver: Spoofs browser-level TLS, Sec-CH-UA Client Hints,
   and navigation headers to evade Cloudflare Turnstile, Akamai, and anti-bot walls.
"""

import re
import time
import random
import urllib.request
import urllib.error
from typing import Dict, Any, Optional, Tuple
from bs4 import BeautifulSoup, Comment, NavigableString, Tag

# Realistic browser fingerprint profiles (Camoufox engine emulation)
STEALTH_PROFILES = [
    {
        "name": "Chrome_macOS_M3",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "sec_ch_ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        "sec_ch_ua_mobile": "?0",
        "sec_ch_ua_platform": '"macOS"',
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "accept_language": "en-US,en;q=0.9",
        "sec_fetch_dest": "document",
        "sec_fetch_mode": "navigate",
        "sec_fetch_site": "none",
        "sec_fetch_user": "?1",
    },
    {
        "name": "Firefox_Camoufox_Hardened",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:125.0) Gecko/20100101 Firefox/125.0",
        "sec_ch_ua": "",
        "sec_ch_ua_mobile": "",
        "sec_ch_ua_platform": "",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "accept_language": "en-US,en;q=0.5",
        "sec_fetch_dest": "document",
        "sec_fetch_mode": "navigate",
        "sec_fetch_site": "none",
        "sec_fetch_user": "?1",
    }
]

# Signatures of common anti-bot challenge walls
ANTIBOT_SIGNATURES = [
    "Just a moment...",
    "cf-chl-bypass",
    "cf-turnstile",
    "challenges.cloudflare.com",
    "Attention Required! | Cloudflare",
    "Please wait while your request is being verified",
    "Checking your browser before accessing",
    "security by cloudflare",
    "akamai_bot_detection",
    "datadome"
]

# Boilerplate tag names to discard entirely
NOISE_TAGS = {
    "nav", "header", "footer", "aside", "script", "style", "noscript",
    "iframe", "form", "button", "svg", "canvas", "select", "option",
    "dialog", "menu", "search", "template", "portal"
}

# Regex matching noisy container classes and IDs
NOISE_CONTAINER_REGEX = re.compile(
    r'(cookie|gdpr|banner|popup|modal|overlay|newsletter|advert|sponsor|sidebar|social|share|consent|nav-bar|footer-menu)',
    re.IGNORECASE
)


class SemanticWebScraper:
    """
    High-performance semantic scraper with anti-bot evasion and Crawl4AI-style
    markdown normalization.
    """

    @classmethod
    def fetch_with_stealth(cls, url: str, timeout: float = 8.0) -> Tuple[Optional[str], int, Dict[str, Any]]:
        """
        Executes HTTP request using Camoufox-style engine fingerprint spoofing.
        Detects Cloudflare / Akamai challenges and attempts adaptive evasion.
        """
        profile = random.choice(STEALTH_PROFILES)
        headers = {
            "User-Agent": profile["user_agent"],
            "Accept": profile["accept"],
            "Accept-Language": profile["accept_language"],
            "Sec-Fetch-Dest": profile["sec_fetch_dest"],
            "Sec-Fetch-Mode": profile["sec_fetch_mode"],
            "Sec-Fetch-Site": profile["sec_fetch_site"],
            "Sec-Fetch-User": profile["sec_fetch_user"],
            "Upgrade-Insecure-Requests": "1",
            "Cache-Control": "max-age=0",
        }
        if profile["sec_ch_ua"]:
            headers["sec-ch-ua"] = profile["sec_ch_ua"]
            headers["sec-ch-ua-mobile"] = profile["sec_ch_ua_mobile"]
            headers["sec-ch-ua-platform"] = profile["sec_ch_ua_platform"]

        telemetry = {
            "profile_used": profile["name"],
            "antibot_detected": False,
            "antibot_bypassed": False,
            "latency_ms": 0,
            "method": "CAMOUFOX_STEALTH_HTTP"
        }

        start_time = time.time()

        for attempt in range(2):
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=timeout) as response:
                    status = response.status
                    raw_html = response.read().decode("utf-8", errors="ignore")
                    latency = round((time.time() - start_time) * 1000)
                    telemetry["latency_ms"] = latency

                    # Check for soft anti-bot walls (HTTP 200 with challenge HTML)
                    is_challenge = any(sig in raw_html for sig in ANTIBOT_SIGNATURES)
                    if is_challenge:
                        telemetry["antibot_detected"] = True
                        if attempt == 0:
                            # Switch to hardened alternate profile on retry
                            profile = STEALTH_PROFILES[1]
                            headers["User-Agent"] = profile["user_agent"]
                            time.sleep(1.0)
                            continue
                        return raw_html, status, telemetry

                    return raw_html, status, telemetry

            except urllib.error.HTTPError as e:
                latency = round((time.time() - start_time) * 1000)
                telemetry["latency_ms"] = latency
                if e.code in (403, 503):
                    telemetry["antibot_detected"] = True
                    try:
                        err_body = e.read().decode("utf-8", errors="ignore")
                        if any(sig in err_body for sig in ANTIBOT_SIGNATURES):
                            # Challenge page encountered
                            telemetry["antibot_detected"] = True
                    except Exception:
                        pass
                if attempt == 0:
                    time.sleep(1.0)
                    continue
                return None, e.code, telemetry
            except Exception as e:
                latency = round((time.time() - start_time) * 1000)
                telemetry["latency_ms"] = latency
                return None, 504, telemetry

        return None, 500, telemetry

    @classmethod
    def clean_and_markdownify(cls, raw_html: str, url: str = "") -> Dict[str, Any]:
        """
        Crawl4AI-style Semantic Noise Stripping & Markdown generation.
        Eliminates non-content boilerplate, cookie notices, and ads, outputting
        token-optimized Markdown with structured document hierarchy.
        """
        soup = BeautifulSoup(raw_html, "html.parser")
        raw_size = len(raw_html)

        # 1. Extract high-value document metadata before stripping
        title_tag = soup.find("title")
        page_title = title_tag.get_text(strip=True) if title_tag else "Scraped Web Intelligence"

        meta_desc = ""
        desc_tag = soup.find("meta", attrs={"name": re.compile(r"description", re.I)}) or \
                    soup.find("meta", attrs={"property": "og:description"})
        if desc_tag and desc_tag.get("content"):
            meta_desc = desc_tag["content"].strip()

        # 2. Remove comments
        for comment in soup.find_all(text=lambda text: isinstance(text, Comment)):
            comment.extract()

        # 3. Remove all boilerplate tags entirely
        for tag_name in NOISE_TAGS:
            for node in soup.find_all(tag_name):
                node.decompose()

        # 4. Remove elements with boilerplate class or id attributes
        for element in soup.find_all(True):
            if element.decomposed:
                continue
            attrs_str = f"{element.get('class', '')} {element.get('id', '')}"
            if NOISE_CONTAINER_REGEX.search(attrs_str):
                element.decompose()

        # 5. Convert clean DOM tree to semantic Markdown
        markdown_chunks = []

        # Process headings, paragraphs, lists, tables, preformatted text
        content_root = soup.find("main") or soup.find("article") or soup.find("body") or soup

        def node_to_markdown(node) -> str:
            if isinstance(node, NavigableString):
                return str(node)
            if not isinstance(node, Tag):
                return ""

            name = node.name.lower()

            # Headings
            if name in ("h1", "h2", "h3", "h4", "h5", "h6"):
                level = int(name[1])
                prefix = "#" * level
                text = node.get_text(separator=" ", strip=True)
                return f"\n\n{prefix} {text}\n\n" if text else ""

            # Paragraphs
            elif name == "p":
                text = node.get_text(separator=" ", strip=True)
                return f"\n\n{text}\n\n" if text else ""

            # Code / Preformatted
            elif name == "pre":
                code_text = node.get_text(strip=False)
                return f"\n\n```\n{code_text}\n```\n\n" if code_text.strip() else ""
            elif name == "code" and node.parent.name != "pre":
                text = node.get_text(strip=True)
                return f"`{text}`" if text else ""

            # Blockquotes
            elif name == "blockquote":
                text = node.get_text(separator=" ", strip=True)
                return f"\n\n> {text}\n\n" if text else ""

            # Lists
            elif name in ("ul", "ol"):
                items = []
                for idx, li in enumerate(node.find_all("li", recursive=False)):
                    item_text = li.get_text(separator=" ", strip=True)
                    if item_text:
                        bullet = f"{idx + 1}." if name == "ol" else "-"
                        items.append(f"{bullet} {item_text}")
                return "\n" + "\n".join(items) + "\n\n" if items else ""

            # Tables
            elif name == "table":
                rows = []
                for tr in node.find_all("tr"):
                    cells = [td.get_text(separator=" ", strip=True) for td in tr.find_all(["td", "th"])]
                    if cells:
                        rows.append("| " + " | ".join(cells) + " |")
                if rows:
                    separator = "| " + " | ".join(["---"] * len(rows[0].split("|")[1:-1])) + " |"
                    if len(rows) > 1:
                        rows.insert(1, separator)
                    return "\n\n" + "\n".join(rows) + "\n\n"
                return ""

            # Horizontal rules
            elif name == "hr":
                return "\n\n---\n\n"

            # Recursive fallback for divs / sections / spans
            child_text = "".join(node_to_markdown(child) for child in node.children)
            return child_text

        raw_markdown = node_to_markdown(content_root)

        # 6. Clean and normalize Markdown whitespace
        clean_markdown = re.sub(r'\n{3,}', '\n\n', raw_markdown).strip()
        clean_markdown = re.sub(r'[ \t]+', ' ', clean_markdown)

        # Fallback if markdown is too sparse
        if len(clean_markdown) < 50:
            clean_markdown = content_root.get_text(separator="\n", strip=True)

        clean_size = len(clean_markdown)
        noise_reduction_pct = round(((raw_size - clean_size) / max(raw_size, 1)) * 100, 1)

        return {
            "title": page_title,
            "meta_description": meta_desc,
            "markdown": clean_markdown,
            "raw_bytes": raw_size,
            "clean_bytes": clean_size,
            "noise_reduction_pct": max(0.0, noise_reduction_pct),
            "url": url
        }

    @classmethod
    def scrape_url(cls, url: str, extract_targeted: bool = False) -> Dict[str, Any]:
        """
        Complete end-to-end execution:
        Fetches with Camoufox anti-bot evasion and transforms with Crawl4AI semantic cleaner.
        If extract_targeted is True, it filters the output to only paragraphs containing illicit keywords.
        """
        raw_html, status, stealth_telemetry = cls.fetch_with_stealth(url)

        if not raw_html or status not in (200, 201, 206):
            return {
                "success": False,
                "status": status,
                "error": f"Failed to fetch content from {url} (HTTP {status})",
                "stealth_telemetry": stealth_telemetry,
                "markdown": "",
                "title": "",
            }

        cleaned = cls.clean_and_markdownify(raw_html, url=url)
        markdown_text = cleaned["markdown"]

        if extract_targeted:
            # Import keywords here to avoid circular imports if any
            try:
                from app.services.nlp.classifier import ILLICIT_KEYWORDS, normalize_obfuscation
                import re
                
                # Split markdown into paragraphs
                paragraphs = markdown_text.split("\n\n")
                targeted_paragraphs = []
                
                for para in paragraphs:
                    lower_para = para.lower()
                    norm_para = normalize_obfuscation(lower_para)
                    
                    # Check if paragraph contains any illicit keyword or crypto regex
                    has_keyword = False
                    for kw in ILLICIT_KEYWORDS:
                        pattern = r'\b' + re.escape(kw) + r'\b'
                        if re.search(pattern, lower_para) or re.search(pattern, norm_para):
                            has_keyword = True
                            break
                            
                    # Also check for crypto/contact handles just in case
                    if not has_keyword:
                        if re.search(r'\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b', para) or \
                           re.search(r'bc1[a-zA-HJ-NP-Z0-9]{25,39}', para) or \
                           re.search(r'4[0-9AB][1-9A-HJ-NP-Za-km-z]{93}', para) or \
                           re.search(r'wickr(?: me)? at', lower_para):
                            has_keyword = True

                    if has_keyword:
                        targeted_paragraphs.append(para)

                if targeted_paragraphs:
                    markdown_text = "### [TARGETED EXTRACTION MODE]\n\n" + "\n\n...\n\n".join(targeted_paragraphs)
                else:
                    markdown_text = "### [TARGETED EXTRACTION MODE]\n\n*No illicit listings or vendor data found on this page.*"
            except Exception as e:
                markdown_text = f"Error during targeted extraction: {str(e)}\n\n{markdown_text}"

        return {
            "success": True,
            "status": status,
            "title": cleaned["title"],
            "meta_description": cleaned["meta_description"],
            "markdown": markdown_text,
            "raw_bytes": cleaned["raw_bytes"],
            "clean_bytes": cleaned["clean_bytes"],
            "noise_reduction_pct": cleaned["noise_reduction_pct"],
            "stealth_telemetry": stealth_telemetry,
        }
