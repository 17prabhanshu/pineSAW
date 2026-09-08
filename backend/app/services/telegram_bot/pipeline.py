"""
Orchestration Pipeline for Telegram OSINT Bot
Coordinates: Source Selection -> Collection -> Normalization ->
Extraction -> Explainable Risk Scoring -> Graph Persistence -> ZeroMQ Broadcast.
"""

import json
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from .models import (
    NormalizedTelegramMessage,
    ExtractedIOC,
    ExplainableRiskScore,
    PublicTelegramSource,
    BotStatus
)
from .collector import TelegramPublicCollector
from .extractor import TelegramIOCExtractor
from .risk_engine import TelegramRiskEngine
from .graph_persister import TelegramGraphPersister


class TelegramOSINTPipeline:
    """
    Central pipeline coordinator for defensive threat-intelligence collection.
    """

    def __init__(self):
        self.collector = TelegramPublicCollector()
        self.persister = TelegramGraphPersister()
        self.status = BotStatus()
        self.history: List[Dict[str, Any]] = []

    def run_pipeline(
        self,
        source_id: str,
        mode: str = "MOCK",  # "LIVE" or "MOCK"
        max_messages: int = 5,
        publish_zmq: bool = True,
        ignore_checkpoint: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Executes an end-to-end ingestion cycle on a public Telegram source.
        """
        self.status.is_running = True
        self.status.mode = mode
        results: List[Dict[str, Any]] = []

        # 1. Collection & Normalization
        if mode == "LIVE":
            messages = self.collector.collect_public_channel(source_id, max_messages=max_messages, ignore_checkpoint=ignore_checkpoint)
            if not messages and not ignore_checkpoint:
                # If checkpoint already reached current end, fetch recent preview messages so analyst can see live content
                messages = self.collector.collect_public_channel(source_id, max_messages=max_messages, ignore_checkpoint=True)
        else:
            messages = self.collector.generate_mock_stream(count=max_messages, source_id=source_id)

        self.status.messages_collected += len(messages)
        self.status.new_messages += len(messages)

        # 2. Process each message through the analysis stages
        for msg in messages:
            # Stage A: IOC & Entity Extraction
            iocs = TelegramIOCExtractor.extract_all(msg)
            self.status.iocs_extracted += len(iocs)

            # Stage B: Explainable Risk Scoring
            risk_score = TelegramRiskEngine.score_message(msg, iocs)
            if risk_score.risk_level in ("CRITICAL", "HIGH"):
                self.status.high_risk_leads += 1

            # Stage C: Graph Persistence (SQLite dev.db)
            persisted_info = self.persister.persist_result(msg, iocs, risk_score)

            # Stage D: ZeroMQ Live Broadcast (socket 5557: darknet.telegram.c2.channel)
            if publish_zmq:
                try:
                    import sys
                    from app.services.ingestion.zmq_broker import zmq_broker
                    zmq_payload = {
                        "source": f"Telegram OSINT ({mode})",
                        "channel": f"darknet.telegram.c2.channel",
                        "headline": f"OSINT Signal [{risk_score.risk_level}]: @{msg.source_id} - {risk_score.summary_rationale[:80]}",
                        "iocs": [{"type": i.entity_type, "value": i.entity} for i in iocs[:4]],
                        "rawHex": msg.raw_hash[:32],
                        "rawJson": {
                            "message_id": msg.message_id,
                            "source_id": msg.source_id,
                            "risk_score": risk_score.total_score,
                            "risk_level": risk_score.risk_level,
                            "hash": msg.raw_hash
                        },
                        "riskLevel": risk_score.risk_level
                    }
                    zmq_broker.publish_message("5557", zmq_payload)
                except Exception:
                    pass

            dump_msg = msg.model_dump() if hasattr(msg, "model_dump") else msg.dict()
            dump_iocs = [i.model_dump() if hasattr(i, "model_dump") else i.dict() for i in iocs]
            dump_score = risk_score.model_dump() if hasattr(risk_score, "model_dump") else risk_score.dict()
            item_result = {
                "message": dump_msg,
                "iocs": dump_iocs,
                "risk_score": dump_score,
                "persisted": persisted_info,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            results.append(item_result)
            self.history.append(item_result)

        # Update checkpoint status
        cp = self.collector.get_checkpoint(source_id)
        if cp:
            self.status.last_checkpoint = cp.get("last_scraped_at", "Unknown")

        self.status.is_running = False
        return results

    def get_status(self) -> BotStatus:
        cp = self.collector.checkpoints
        self.status.sources_monitored = len(cp)
        return self.status


# Global pipeline singleton
_pipeline_instance: Optional[TelegramOSINTPipeline] = None

def get_pipeline() -> TelegramOSINTPipeline:
    global _pipeline_instance
    if _pipeline_instance is None:
        _pipeline_instance = TelegramOSINTPipeline()
    return _pipeline_instance
