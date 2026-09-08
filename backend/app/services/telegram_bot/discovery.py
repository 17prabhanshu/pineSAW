"""
Automated Public-Source Discovery Layer for Telegram OSINT
Orchestrates keyword discovery, candidate deduplication, clearweb verification,
lifecycle state transitions, and the automatic monitoring queue for ingestion.
"""

import os
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from .config import (
    SOURCES_REGISTRY_FILE,
    THREAT_KEYWORDS,
    get_flat_threat_keywords
)
from .discovery_client import TelegramPublicDiscoveryClient


class TelegramSourceDiscovery:
    """
    Manages source discovery lifecycle:
    Discovery -> Public Verification -> Source Registry -> Monitoring Queue.
    """

    def __init__(self, registry_file: str = SOURCES_REGISTRY_FILE):
        self.registry_file = registry_file
        self.client = TelegramPublicDiscoveryClient()
        self.registry: Dict[str, Any] = self._load_registry()
        self.activity_log: List[Dict[str, str]] = []

    def _load_registry(self) -> Dict[str, Any]:
        if os.path.exists(self.registry_file):
            try:
                with open(self.registry_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return {
            "sources": {},
            "last_discovery": None,
            "keywords_scanned": 0,
            "mode": "LIVE",
            "monitoring_queue": []
        }

    def _save_registry(self):
        os.makedirs(os.path.dirname(self.registry_file), exist_ok=True)
        with open(self.registry_file, "w", encoding="utf-8") as f:
            json.dump(self.registry, f, indent=2)

    def log_activity(self, action: str, details: str):
        now_time = datetime.now(timezone.utc).strftime("%H:%M:%S")
        self.activity_log.insert(0, {
            "time": now_time,
            "action": action,
            "details": details
        })
        if len(self.activity_log) > 60:
            self.activity_log = self.activity_log[:60]

    def discover_candidates(
        self,
        keywords: Optional[List[str]] = None,
        mode: str = "LIVE",
        limit_per_keyword: int = 5
    ) -> Dict[str, Any]:
        """
        Executes automated public channel discovery for threat keywords.
        Performs clearweb public verification, deduplication, and registry insertion.
        """
        kw_list = keywords or get_flat_threat_keywords()[:6]
        now_iso = datetime.now(timezone.utc).isoformat()
        self.registry["mode"] = mode
        self.registry["keywords_scanned"] = len(kw_list)

        new_candidates_count = 0
        already_known_count = 0
        verified_count = 0
        newly_found_sources: List[Dict[str, Any]] = []

        self.log_activity("DISCOVERY_START", f"Starting discovery across {len(kw_list)} keywords in {mode} mode")

        # Call discovery client
        raw_candidates = self.client.search_public_sources(
            keywords=kw_list,
            limit_per_keyword=limit_per_keyword,
            mode=mode
        )

        for cand in raw_candidates:
            chan_username = cand["channel_username"].lower()
            cand_keywords = cand.get("discovered_keywords", [])

            self.log_activity("CANDIDATE_FOUND", f"Found @{cand['channel_username']} via {', '.join(cand_keywords)}")

            # Check clearweb public accessibility
            is_verified = self.client.verify_public_accessibility(chan_username)
            cand["verified_public"] = is_verified
            if is_verified:
                verified_count += 1
                self.log_activity("VERIFIED_PUBLIC", f"@{cand['channel_username']} verified as clearweb public channel")
                # Enrich with live profile metadata if available
                profile = self.client.get_public_channel_profile(chan_username)
                if profile:
                    cand["title"] = profile.get("title") or cand.get("title")
                    cand["description"] = profile.get("description") or cand.get("description")
                    cand["subscriber_count"] = profile.get("subscriber_count") or cand.get("subscriber_count", 0)
            else:
                self.log_activity("UNVERIFIED", f"@{cand['channel_username']} failed clearweb public preview check")

            # Check registry for deduplication
            if chan_username in self.registry["sources"]:
                already_known_count += 1
                existing = self.registry["sources"][chan_username]
                for k in cand_keywords:
                    if k not in existing.setdefault("discovered_keywords", []):
                        existing["discovered_keywords"].append(k)
                existing["verified_public"] = is_verified
                if is_verified and cand.get("subscriber_count", 0) > 0:
                    existing["subscriber_count"] = cand["subscriber_count"]
                    existing["title"] = cand.get("title") or existing.get("title")
                    existing["description"] = cand.get("description") or existing.get("description")
            else:
                new_candidates_count += 1
                cand["status"] = "CANDIDATE"
                self.registry["sources"][chan_username] = cand
                newly_found_sources.append(cand)
                self.log_activity("REGISTRY_ADDED", f"Added @{chan_username} to candidate registry")

        self.registry["last_discovery"] = now_iso
        self._save_registry()

        return {
            "keywords_scanned": len(kw_list),
            "candidates_discovered": len(raw_candidates),
            "new_sources": new_candidates_count,
            "previously_known": already_known_count,
            "publicly_verified": verified_count,
            "candidates": newly_found_sources,
            "summary": self.get_summary()
        }

    def update_source_status(self, channel_username: str, new_status: str) -> Optional[Dict[str, Any]]:
        """
        Updates source lifecycle status: CANDIDATE -> APPROVED -> MONITORING -> REJECTED.
        Automatically updates the monitoring queue.
        """
        clean = channel_username.lstrip("@").strip().lower()
        if not clean:
            return None

        if clean not in self.registry["sources"]:
            self.registry["sources"][clean] = {
                "channel_username": clean,
                "title": clean,
                "description": f"Public Telegram source ({clean})",
                "verified_public": True,
                "discovered_keywords": ["manual_queue"],
                "status": new_status,
                "discovered_at": datetime.now(timezone.utc).isoformat()
            }
        else:
            self.registry["sources"][clean]["status"] = new_status

        # Update automatic monitoring queue
        q = self.registry.setdefault("monitoring_queue", [])
        if new_status == "MONITORING" and clean not in q:
            q.append(clean)
            self.log_activity("QUEUE_PROMOTED", f"@{clean} added to automatic monitoring queue")
        elif new_status != "MONITORING" and clean in q:
            q.remove(clean)
            self.log_activity("QUEUE_REMOVED", f"@{clean} removed from monitoring queue")

        self._save_registry()
        return self.registry["sources"][clean]

    def get_monitoring_queue(self) -> List[str]:
        """Returns list of channels active in the automatic monitoring queue."""
        return self.registry.get("monitoring_queue", [])

    def pop_next_monitoring_source(self) -> Optional[str]:
        """
        Pulls the next source from the monitoring queue for automatic collection.
        Cycles back to the end of the queue for recurring monitoring.
        """
        q = self.registry.get("monitoring_queue", [])
        if not q:
            # Fallback to any approved source if queue empty
            approved = [s for s, data in self.registry.get("sources", {}).items() if data.get("status") in ("MONITORING", "APPROVED")]
            if approved:
                return approved[0]
            return None
        src = q.pop(0)
        q.append(src)  # Cycle to maintain monitoring loop
        self._save_registry()
        return src

    def get_summary(self) -> Dict[str, Any]:
        """
        Returns full aggregate metrics for the UI and Bot commands.
        """
        sources = self.registry.get("sources", {})
        total_found = len(sources)
        publicly_verified = sum(1 for s in sources.values() if s.get("verified_public"))
        queued = sum(1 for s in sources.values() if s.get("status") in ("CANDIDATE", "APPROVED"))
        monitoring = sum(1 for s in sources.values() if s.get("status") == "MONITORING")

        return {
            "mode": self.registry.get("mode", "LIVE"),
            "keywords_scanned": self.registry.get("keywords_scanned", 0),
            "sources_found": total_found,
            "candidates_discovered": total_found,
            "publicly_verified": publicly_verified,
            "publicly_accessible": publicly_verified,
            "queued": queued,
            "monitoring": monitoring,
            "last_discovery": self.registry.get("last_discovery") or "Never",
            "monitoring_queue": self.get_monitoring_queue(),
            "activity_log": self.activity_log[:15],
            "sources": list(sources.values())
        }


# Global discovery singleton
discovery_service = TelegramSourceDiscovery()
