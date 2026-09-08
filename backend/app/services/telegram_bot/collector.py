"""
Public-Source Collector for Telegram OSINT
Implements incremental collection, rate limiting, exponential backoff,
checkpoints, deduplication, and completely offline Mock Mode with synthetic test fixtures.
"""

import os
import json
import time
import random
import re
import urllib.request
import urllib.error
import concurrent.futures
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Tuple

from .config import (
    CHECKPOINTS_FILE,
    SOURCES_REGISTRY_FILE,
    REQUEST_DELAY_SECONDS,
    MAX_RETRIES,
    EXPONENTIAL_BACKOFF_BASE,
)
from .models import NormalizedTelegramMessage, PublicTelegramSource
from .normalizer import TelegramMessageNormalizer
from .cti_presets import get_cti_presets


class TelegramPublicCollector:
    """
    Collects public messages from Telegram web previews (t.me/s/{channel})
    or generates offline synthetic test fixtures when running in Mock Mode.
    """

    def __init__(self, checkpoints_file: str = CHECKPOINTS_FILE):
        self.checkpoints_file = checkpoints_file
        self.checkpoints: Dict[str, Dict[str, Any]] = self._load_checkpoints()
        self.seen_hashes: set = set()

    def _load_checkpoints(self) -> Dict[str, Dict[str, Any]]:
        if os.path.exists(self.checkpoints_file):
            try:
                with open(self.checkpoints_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return {}
        return {}

    def save_checkpoint(self, source_id: str, last_msg_id: int, collected_count: int):
        clean_source = source_id.lstrip("@").strip()
        existing = self.checkpoints.get(clean_source, {})
        self.checkpoints[clean_source] = {
            "source_id": clean_source,
            "last_message_id": max(last_msg_id, existing.get("last_message_id", 0)),
            "last_scraped_at": datetime.now(timezone.utc).isoformat(),
            "total_messages_collected": existing.get("total_messages_collected", 0) + collected_count,
        }
        os.makedirs(os.path.dirname(self.checkpoints_file), exist_ok=True)
        with open(self.checkpoints_file, "w", encoding="utf-8") as f:
            json.dump(self.checkpoints, f, indent=2)

    def get_checkpoint(self, source_id: str) -> Optional[Dict[str, Any]]:
        clean_source = source_id.lstrip("@").strip()
        return self.checkpoints.get(clean_source)

    @staticmethod
    def _clean_channel_target(channel_username: str) -> Tuple[str, Optional[int]]:
        """
        Normalizes target string from user inputs:
        Handles:
          - '@tri_city_dead_drops' -> 'tri_city_dead_drops'
          - 'https://t.me/tri_city_dead_drops' -> 'tri_city_dead_drops'
          - 'https://t.me/s/durov' -> 'durov'
          - 'https://t.me/durov/547' -> 'durov', msg_id=547
          - 't.me/durov' -> 'durov'
        """
        clean_target = channel_username.strip()
        msg_id_match = re.search(r'(?:t\.me|telegram\.me)/(?:s/)?([a-zA-Z0-9_]{3,32})/([0-9]+)', clean_target)
        target_msg_id = int(msg_id_match.group(2)) if msg_id_match else None

        clean_channel = re.sub(r'^(?:https?://)?(?:www\.)?(?:telegram\.me|t\.me)/(?:s/)?', '', clean_target, flags=re.IGNORECASE)
        clean_channel = clean_channel.lstrip("@").split("/")[0].strip()
        return clean_channel, target_msg_id

    def collect_public_channel(self, channel_username: str, max_messages: int = 20, ignore_checkpoint: bool = False) -> List[NormalizedTelegramMessage]:
        """
        Fetches public channel or group web preview.
        Supports:
          1. Tactical CTI scenario presets (@tri_city_dead_drops, @shadow_escrow_chd, @dark_pharm_reup)
          2. Live public channel feeds (t.me/s/{channel})
          3. Live singular message embed widgets (t.me/{channel}/{id}?embed=1)
          4. Live public supergroup landing pages & embed probing
        """
        clean_channel, target_msg_id = self._clean_channel_target(channel_username)
        if not clean_channel or clean_channel.startswith("+"):
            # Private invite links not supported / out of scope
            return []

        # 1. Check CTI Threat Intelligence Presets
        cti_presets = get_cti_presets()
        lower_channel = clean_channel.lower()
        if lower_channel in cti_presets:
            preset_items = cti_presets[lower_channel]
            messages: List[NormalizedTelegramMessage] = []
            checkpoint = self.get_checkpoint(clean_channel)
            last_recorded_id = checkpoint.get("last_message_id", 0) if (checkpoint and not ignore_checkpoint) else 0
            new_max_id = last_recorded_id

            total_presets = len(preset_items)
            for idx, post in enumerate(preset_items):
                msg_num = total_presets - idx  # Newest post (idx 0) has highest id
                if not ignore_checkpoint and msg_num <= last_recorded_id:
                    continue

                norm = TelegramMessageNormalizer.normalize({
                    "source_id": clean_channel,
                    "telegram_message_id": msg_num,
                    "text": post["text"],
                    "media_type": post.get("media_type", "NONE"),
                    "author_public_username": post.get("sender"),
                    "timestamp": post.get("timestamp"),
                    "message_url": f"https://t.me/{clean_channel}/{msg_num}",
                })

                if ignore_checkpoint or (norm.raw_hash not in self.seen_hashes):
                    self.seen_hashes.add(norm.raw_hash)
                    messages.append(norm)
                    if msg_num > new_max_id:
                        new_max_id = msg_num

                if len(messages) >= max_messages:
                    break

            if messages:
                self.save_checkpoint(clean_channel, new_max_id, len(messages))
            elif not ignore_checkpoint:
                # If checkpoint reached end, return the latest presets so investigator can always inspect
                return self.collect_public_channel(channel_username, max_messages=max_messages, ignore_checkpoint=True)
            return messages

        # 2. Live Channel / Group Collection
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        # 2A. Specific message ID targeted via embed widget
        if target_msg_id:
            embed_messages = self._probe_embed_messages(clean_channel, [target_msg_id] + list(range(max(1, target_msg_id - 4), target_msg_id + 5)), ignore_checkpoint=ignore_checkpoint)
            if embed_messages:
                return embed_messages[:max_messages]

        # 2B. Standard Public Channel Web Preview: https://t.me/s/{clean_channel}
        url = f"https://t.me/s/{clean_channel}"
        html = None
        for attempt in range(MAX_RETRIES):
            try:
                time.sleep(REQUEST_DELAY_SECONDS)
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=10) as response:
                    if response.status == 200:
                        html = response.read().decode("utf-8", errors="ignore")
                        break
            except urllib.error.HTTPError as e:
                if e.code == 429:  # Rate limited
                    backoff = EXPONENTIAL_BACKOFF_BASE ** attempt + random.uniform(1.0, 3.0)
                    time.sleep(backoff)
                elif e.code in (404, 403):
                    break
            except Exception:
                backoff = EXPONENTIAL_BACKOFF_BASE ** attempt
                time.sleep(backoff)

        if html:
            parsed = self._parse_telegram_html(html, clean_channel, max_messages, ignore_checkpoint=ignore_checkpoint)
            if parsed:
                return parsed

        # 2C. Fallback for Public Supergroups / Embed probing (when /s/ is not exposed)
        group_meta, embed_msgs = self._scrape_group_fallback(clean_channel, max_messages, ignore_checkpoint=ignore_checkpoint)
        if embed_msgs:
            return embed_msgs
        if group_meta:
            norm = TelegramMessageNormalizer.normalize({
                "source_id": clean_channel,
                "telegram_message_id": 1,
                "text": f"[TELEGRAM PUBLIC GROUP INTERCEPT] {group_meta.get('title', clean_channel)}: {group_meta.get('extra', 'Public Group')}. Verified public group landing page intercepted at https://t.me/{clean_channel}.",
                "media_type": "NONE",
                "message_url": f"https://t.me/{clean_channel}",
            })
            if norm.raw_hash not in self.seen_hashes:
                self.seen_hashes.add(norm.raw_hash)
            return [norm]

        return []

    def _probe_single_embed(self, clean_channel: str, m_id: int) -> Optional[NormalizedTelegramMessage]:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        try:
            embed_url = f"https://t.me/{clean_channel}/{m_id}?embed=1"
            req = urllib.request.Request(embed_url, headers=headers)
            with urllib.request.urlopen(req, timeout=3.0) as resp:
                if resp.status == 200:
                    m_html = resp.read().decode("utf-8", errors="ignore")
                    if "Post not found" in m_html or "tgme_widget_message_error" in m_html:
                        return None
                    text_match = re.search(r'<div class="tgme_widget_message_text[^"]*"[^>]*>(.*?)</div>', m_html, re.DOTALL)
                    author_match = re.search(r'class="tgme_widget_message_author_name"[^>]*>[\s\S]*?<span[^>]*>([^<]+)</span>', m_html)
                    time_match = re.search(r'datetime="([^"]+)"', m_html)
                    raw_text = ""
                    if text_match:
                        raw_text = re.sub(r'<br\s*/?>', '\n', text_match.group(1))
                        raw_text = re.sub(r'<[^>]+>', '', raw_text)
                        raw_text = raw_text.replace("&#036;", "$").replace("&amp;", "&").replace("&quot;", '"').replace("&lt;", "<").replace("&gt;", ">").strip()

                    author = author_match.group(1).strip() if author_match else f"@{clean_channel}"
                    ts = time_match.group(1) if time_match else datetime.now(timezone.utc).isoformat()
                    media_type = "PHOTO" if 'tgme_widget_message_photo_wrap' in m_html else ("VIDEO" if 'tgme_widget_message_video' in m_html else "NONE")

                    if not raw_text and media_type != "NONE":
                        raw_text = f"[{media_type.capitalize()} Attachment intercepted from @{clean_channel}]"

                    if raw_text:
                        return TelegramMessageNormalizer.normalize({
                            "source_id": clean_channel,
                            "telegram_message_id": m_id,
                            "text": raw_text,
                            "author_public_username": author,
                            "media_type": media_type,
                            "timestamp": ts,
                            "message_url": f"https://t.me/{clean_channel}/{m_id}",
                        })
        except Exception:
            pass
        return None

    def _probe_embed_messages(self, clean_channel: str, msg_ids: List[int], ignore_checkpoint: bool = False) -> List[NormalizedTelegramMessage]:
        sorted_ids = sorted(list(set(msg_ids)), reverse=True)
        messages: List[NormalizedTelegramMessage] = []
        if not sorted_ids:
            return messages

        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            futures = {executor.submit(self._probe_single_embed, clean_channel, m_id): m_id for m_id in sorted_ids}
            results_dict = {}
            for future in concurrent.futures.as_completed(futures):
                m_id = futures[future]
                try:
                    norm = future.result()
                    if norm:
                        results_dict[m_id] = norm
                except Exception:
                    pass

        for m_id in sorted_ids:
            if m_id in results_dict:
                norm = results_dict[m_id]
                if ignore_checkpoint or (norm.raw_hash not in self.seen_hashes):
                    self.seen_hashes.add(norm.raw_hash)
                    messages.append(norm)
        return messages

    def _find_highest_group_msg_id(self, clean_channel: str, ignore_checkpoint: bool = False) -> int:
        """
        Uses exponential probing + binary search to rapidly find the latest (highest)
        message ID in a Telegram group, resilient to deleted messages.
        """
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

        def exists(m_id: int) -> bool:
            if m_id <= 0:
                return False
            try:
                url = f"https://t.me/{clean_channel}/{m_id}?embed=1"
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=2.0) as resp:
                    html = resp.read().decode("utf-8", errors="ignore")
                    return ("Post not found" not in html) and ("tgme_widget_message_error" not in html)
            except Exception:
                return False

        def batch_exists(ids: List[int]) -> bool:
            with concurrent.futures.ThreadPoolExecutor(max_workers=min(len(ids), 6)) as pool:
                res = list(pool.map(exists, ids))
                return any(res)

        checkpoint = self.get_checkpoint(clean_channel)
        start_hint = 1
        if checkpoint and not ignore_checkpoint:
            candidate = checkpoint.get("last_message_id", 1)
            if candidate > 1 and exists(candidate):
                start_hint = candidate

        # Step 1: Exponential upward probe
        low = max(1, start_hint)
        high = max(10, low * 2)

        while high <= 100000:
            if batch_exists([high, high + 1, high + 2]):
                low = high
                high *= 2
            else:
                break

        # Step 2: Binary search between low and high
        best = low
        l, r = low, high
        while l <= r:
            mid = (l + r) // 2
            if batch_exists([mid, mid + 1]):
                best = max(best, mid)
                l = mid + 1
            else:
                r = mid - 1

        # Step 3: Check forward past any deleted message gaps concurrently
        fwd_ids = list(range(best + 1, best + 10))
        with concurrent.futures.ThreadPoolExecutor(max_workers=len(fwd_ids)) as pool:
            for test_id, found in zip(fwd_ids, pool.map(exists, fwd_ids)):
                if found:
                    best = max(best, test_id)

        return best

    def _scrape_group_fallback(self, clean_channel: str, max_messages: int, ignore_checkpoint: bool = False) -> Tuple[Optional[Dict[str, str]], List[NormalizedTelegramMessage]]:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        group_meta = None
        # 1. Fetch group profile landing page
        try:
            req = urllib.request.Request(f"https://t.me/{clean_channel}", headers=headers)
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status == 200:
                    html = resp.read().decode("utf-8", errors="ignore")
                    t_match = re.search(r'class="tgme_page_title"[^>]*>[\s\S]*?<span[^>]*>([^<]+)</span>', html)
                    e_match = re.search(r'class="tgme_page_extra">([^<]+)</div>', html)
                    if t_match or e_match:
                        group_meta = {
                            "title": t_match.group(1).strip() if t_match else clean_channel,
                            "extra": e_match.group(1).strip() if e_match else "Public Group"
                        }
        except Exception:
            pass

        # 2. Automatically discover the highest (latest) message ID in the group
        highest_id = self._find_highest_group_msg_id(clean_channel, ignore_checkpoint=ignore_checkpoint)

        # 3. Probe backwards from highest_id to collect the true LATEST messages
        # Allow checking a generous window to skip over any deleted messages
        probe_window = list(range(highest_id, max(0, highest_id - max(20, max_messages * 4)), -1))
        embed_msgs = self._probe_embed_messages(clean_channel, probe_window, ignore_checkpoint=ignore_checkpoint)

        if embed_msgs:
            # Update checkpoint with the highest message ID found
            new_max_id = max(m.telegram_message_id for m in embed_msgs)
            self.save_checkpoint(clean_channel, new_max_id, len(embed_msgs[:max_messages]))

        return group_meta, embed_msgs[:max_messages]

    def _parse_telegram_html(self, html: str, channel_username: str, max_messages: int, ignore_checkpoint: bool = False) -> List[NormalizedTelegramMessage]:
        parsed_candidates: List[NormalizedTelegramMessage] = []
        msg_blocks = html.split('<div class="tgme_widget_message_wrap')
        if len(msg_blocks) <= 1:
            raw_blocks = re.findall(r'<div class="tgme_widget_message\b.*?(?=<div class="tgme_widget_message\b|$)', html, re.DOTALL)
            msg_blocks = [""] + raw_blocks

        for block in msg_blocks[1:]:
            data_post = re.search(r'data-post="([^"]+)"', block)
            if not data_post:
                continue

            post_ref = data_post.group(1)
            parts = post_ref.split("/")
            if len(parts) != 2:
                continue

            try:
                msg_num = int(parts[1])
            except ValueError:
                continue

            # Accurate timestamp from datetime attribute
            time_m = re.search(r'datetime="([^"]+)"', block)
            timestamp = time_m.group(1) if time_m else datetime.now(timezone.utc).isoformat()

            # Author name
            author_m = re.search(r'class="(?:tgme_widget_message_owner_name|tgme_widget_message_author_name)"[^>]*>[\s\S]*?<span[^>]*>([^<]+)</span>', block)
            author = author_m.group(1).strip() if author_m else f"@{channel_username}"

            # Message text
            text_match = re.search(r'<div class="tgme_widget_message_text[^"]*"[^>]*>(.*?)</div>', block, re.DOTALL)
            raw_text = ""
            if text_match:
                raw_text = re.sub(r'<br\s*/?>', '\n', text_match.group(1))
                raw_text = re.sub(r'<[^>]+>', '', raw_text)
                raw_text = raw_text.replace("&#036;", "$").replace("&amp;", "&").replace("&quot;", '"').replace("&lt;", "<").replace("&gt;", ">").strip()

            # Media type
            media_type = "PHOTO" if 'tgme_widget_message_photo_wrap' in block else (
                "VIDEO" if 'tgme_widget_message_video' in block else (
                    "DOCUMENT" if 'tgme_widget_message_document' in block else (
                        "VOICE" if 'tgme_widget_message_voice' in block else "NONE"
                    )
                )
            )

            # Informative fallback if message has media without textual caption
            if not raw_text:
                if media_type != "NONE":
                    raw_text = f"[{media_type.capitalize()} Attachment intercepted from @{channel_username}]"
                else:
                    continue

            norm = TelegramMessageNormalizer.normalize({
                "source_id": channel_username,
                "telegram_message_id": msg_num,
                "text": raw_text,
                "author_public_username": author,
                "media_type": media_type,
                "timestamp": timestamp,
                "message_url": f"https://t.me/{channel_username}/{msg_num}",
            })
            parsed_candidates.append(norm)

        if not parsed_candidates:
            return []

        # CRITICAL: Sort candidates in descending order (highest message ID / newest timestamp first)
        # so the analyst receives the true LATEST messages from the channel!
        parsed_candidates.sort(key=lambda m: m.telegram_message_id, reverse=True)
        highest_id_on_page = parsed_candidates[0].telegram_message_id

        checkpoint = self.get_checkpoint(channel_username)
        last_recorded_id = checkpoint.get("last_message_id", 0) if (checkpoint and not ignore_checkpoint) else 0

        if ignore_checkpoint:
            selected = parsed_candidates[:max_messages]
            self.save_checkpoint(channel_username, highest_id_on_page, len(selected))
            return selected

        # If checking checkpoint, filter only messages newer than last checkpoint
        new_messages = [m for m in parsed_candidates if m.telegram_message_id > last_recorded_id]
        if new_messages:
            selected = new_messages[:max_messages]
            self.save_checkpoint(channel_username, highest_id_on_page, len(selected))
            return selected
        else:
            # If all messages on the current page have already been checkpointed,
            # fallback to returning the latest messages from the page so the analyst
            # always sees the active channel stream.
            return parsed_candidates[:max_messages]

    def generate_mock_stream(self, count: int = 5, source_id: Optional[str] = None) -> List[NormalizedTelegramMessage]:
        """
        Generates offline synthetic test fixtures clearly labeled as SYNTHETIC TEST DATA.
        Demonstrates collection, normalization, deduplication, and hashing without network calls.
        """
        sources = [source_id] if source_id else ["TEST_SOURCE_ALPHA", "TEST_SOURCE_BETA", "TEST_MONITOR_CORRIDOR"]
        synthetic_fixtures = [
            {
                "template": "[SYNTHETIC TEST DATA] Alert: THREAT_TERM_A detected in transit. Payment indicator PAYMENT_INDICATOR_A observed. Handle @PUBLIC_HANDLE_ALPHA in LOCATION_EXAMPLE_A with QUANTITY_FLAG_A.",
                "media": "NONE"
            },
            {
                "template": "[SYNTHETIC TEST DATA] Incident report: Cross-channel correlation found for THREAT_TERM_B. Wallet bc1q9v8084n809g8a0sdv8a09 settlement. Contact wickr: COMM_HANDLE_B. Transit: REGION_DELHI_NCR.",
                "media": "PHOTO"
            },
            {
                "template": "[SYNTHETIC TEST DATA] Automated detection: Contraband indicator THREAT_TERM_C flagged. Monero address 44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otRmvJMSeeUUL4up7EJa6EDV3ZJaUMXTFrnQ6Xh3KZTAxAQUU92NW referenced. Batch size 500 units.",
                "media": "NONE"
            },
            {
                "template": "[SYNTHETIC TEST DATA] Logistics bulletin: Dead drop operational pattern identified with COMM_HANDLE_A in REGION_PUNJAB. Contact email: EMAIL_EXAMPLE_01@proton.me. Checkpoint verified.",
                "media": "DOCUMENT"
            },
            {
                "template": "[SYNTHETIC TEST DATA] Signal intercept note: THREAT_TERM_A repeated across sources. Telegram handle @PUBLIC_HANDLE_B active in TRANSIT_CORRIDOR_ALPHA. Sample lot 10kg referenced.",
                "media": "NONE"
            }
        ]

        messages: List[NormalizedTelegramMessage] = []
        now_iso = datetime.now(timezone.utc).isoformat()

        for i in range(count):
            src = random.choice(sources)
            checkpoint = self.get_checkpoint(src)
            last_id = checkpoint.get("last_message_id", 100) if checkpoint else 100
            new_id = last_id + i + 1

            fixture = synthetic_fixtures[i % len(synthetic_fixtures)]
            text = fixture["template"]

            norm = TelegramMessageNormalizer.normalize({
                "source_id": src,
                "telegram_message_id": new_id,
                "text": text,
                "media_type": fixture["media"],
                "timestamp": now_iso,
                "discovered_at": now_iso,
                "message_url": f"https://t.me/{src}/{new_id}",
            })

            if norm.raw_hash not in self.seen_hashes:
                self.seen_hashes.add(norm.raw_hash)
                messages.append(norm)

        if messages:
            # Update checkpoint for the primary source
            primary_src = messages[-1].source_id
            self.save_checkpoint(primary_src, messages[-1].telegram_message_id, len(messages))

        return messages
