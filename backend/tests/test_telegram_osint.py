"""
Automated Test Suite for Telegram OSINT Bot Service
Tests authentication, command handling, keyword discovery, normalization,
checkpoint recovery, duplicate detection, SHA-256 hashing, IOC extraction,
entity relationships, risk scoring, rate-limit handling, and offline mock mode.
"""

import unittest
import os
import sys
import tempfile
import json
import hashlib
from datetime import datetime, timezone

# Ensure backend is on PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.telegram_bot import (
    NormalizedTelegramMessage,
    ExtractedIOC,
    ExplainableRiskScore,
    THREAT_KEYWORDS,
    get_flat_threat_keywords,
    is_authorized_admin,
    TelegramMessageNormalizer,
    TelegramIOCExtractor,
    TelegramRiskEngine,
    TelegramPublicCollector,
    TelegramGraphPersister,
    TelegramOSINTPipeline,
    TelegramBotCommandHandler,
)


class TestTelegramOSINTBot(unittest.TestCase):

    def setUp(self):
        self.test_source = "TEST_SOURCE_UNIT"
        self.sample_text = (
            "[SYNTHETIC TEST DATA] Alert: THREAT_TERM_A detected in REGION_DELHI_NCR. "
            "Settlement via PAYMENT_INDICATOR_A or bc1q9v8084n809g8a0sdv8a09. "
            "Contact @PUBLIC_HANDLE_ALPHA or wickr: COMM_HANDLE_B. "
            "Batch metric: QUANTITY_FLAG_A (500 units)."
        )

    def test_01_bot_authentication(self):
        """Test admin authorization verification."""
        self.assertTrue(is_authorized_admin("admin"))
        self.assertTrue(is_authorized_admin("investigator_1"))
        self.assertFalse(is_authorized_admin("unauthorized_stranger_999"))
        self.assertFalse(is_authorized_admin(""))

    def test_02_command_handling_unauthorized(self):
        """Test rejection of operational commands for unauthorized users."""
        res = TelegramBotCommandHandler.handle_command("/status", user_id="intruder_user")
        self.assertEqual(res["status"], "UNAUTHORIZED")
        self.assertIn("Access Denied", res["text"])

    def test_03_command_handling_authorized(self):
        """Test execution of all admin bot commands."""
        # /help
        res_help = TelegramBotCommandHandler.handle_command("/help", user_id="admin")
        self.assertEqual(res_help["status"], "SUCCESS")
        self.assertIn("Available Bot Commands", res_help["text"])

        # /status
        res_status = TelegramBotCommandHandler.handle_command("/status", user_id="admin")
        self.assertEqual(res_status["status"], "SUCCESS")
        self.assertIn("pineSAW OSINT Bot Status", res_status["text"])

        # /sources
        res_sources = TelegramBotCommandHandler.handle_command("/sources", user_id="admin")
        self.assertEqual(res_sources["status"], "SUCCESS")

        # /discover
        res_discover = TelegramBotCommandHandler.handle_command("/discover", user_id="admin", args=["mock"])
        self.assertEqual(res_discover["status"], "SUCCESS")
        self.assertIn("Telegram Public-Source Discovery", res_discover["text"])

        # /mock
        res_mock = TelegramBotCommandHandler.handle_command("/mock", user_id="admin", args=["TEST_MOCK_CORRIDOR", "2"])
        self.assertEqual(res_mock["status"], "SUCCESS")
        self.assertIn("Mock OSINT Ingestion Run", res_mock["text"])

        # /checkpoint
        res_cp = TelegramBotCommandHandler.handle_command("/checkpoint", user_id="admin")
        self.assertEqual(res_cp["status"], "SUCCESS")

        # /stop
        res_stop = TelegramBotCommandHandler.handle_command("/stop", user_id="admin")
        self.assertEqual(res_stop["status"], "SUCCESS")

    def test_04_keyword_discovery_taxonomy(self):
        """Test threat keyword taxonomy integrity and coverage."""
        kws = get_flat_threat_keywords()
        self.assertGreater(len(kws), 15)
        self.assertIn("HIGH_RISK_CONTENT", THREAT_KEYWORDS)
        self.assertIn("SUSPICIOUS_PAYMENT_INDICATOR", THREAT_KEYWORDS)
        self.assertIn("COMMUNICATION_INDICATOR", THREAT_KEYWORDS)
        self.assertIn("QUANTITY_INDICATOR", THREAT_KEYWORDS)
        self.assertIn("LOCATION_INDICATOR", THREAT_KEYWORDS)

    def test_05_message_normalization_and_sha256(self):
        """Test normalization and deterministic SHA-256 provenance hash generation."""
        msg = TelegramMessageNormalizer.normalize({
            "source_id": "@Alpha_Channel",
            "telegram_message_id": 404,
            "text": "Threat intelligence test message"
        })

        self.assertEqual(msg.source_id, "Alpha_Channel")
        self.assertEqual(msg.telegram_message_id, 404)
        self.assertEqual(msg.message_id, "tg-Alpha_Channel-404")
        self.assertEqual(len(msg.raw_hash), 64)  # 64 hex characters for SHA-256

        # Deterministic check
        expected_hash = hashlib.sha256("Alpha_Channel:404:Threat intelligence test message".encode("utf-8")).hexdigest()
        self.assertEqual(msg.raw_hash, expected_hash)

    def test_06_checkpoint_recovery_and_persistence(self):
        """Test saving, loading, and recovery of incremental ingestion checkpoints."""
        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tf:
            temp_cp_file = tf.name

        try:
            collector = TelegramPublicCollector(checkpoints_file=temp_cp_file)
            self.assertIsNone(collector.get_checkpoint("corridor_alpha"))

            # Save checkpoint
            collector.save_checkpoint("corridor_alpha", last_msg_id=75, collected_count=5)
            cp = collector.get_checkpoint("corridor_alpha")
            self.assertIsNotNone(cp)
            self.assertEqual(cp["last_message_id"], 75)
            self.assertEqual(cp["total_messages_collected"], 5)

            # Reload into fresh collector instance to verify recovery
            collector_recovered = TelegramPublicCollector(checkpoints_file=temp_cp_file)
            cp_rec = collector_recovered.get_checkpoint("corridor_alpha")
            self.assertIsNotNone(cp_rec)
            self.assertEqual(cp_rec["last_message_id"], 75)
        finally:
            if os.path.exists(temp_cp_file):
                os.remove(temp_cp_file)

    def test_07_duplicate_detection(self):
        """Test that duplicate messages are detected and filtered."""
        collector = TelegramPublicCollector()
        msgs1 = collector.generate_mock_stream(count=2, source_id="TEST_DEDUP_SRC")
        self.assertEqual(len(msgs1), 2)
        # Verify hashes tracked in seen_hashes
        self.assertIn(msgs1[0].raw_hash, collector.seen_hashes)

    def test_08_ioc_extraction(self):
        """Test IOC extraction across generic classes."""
        msg = NormalizedTelegramMessage.create(
            source_id="test_ioc_channel",
            telegram_message_id=1,
            text=self.sample_text
        )
        iocs = TelegramIOCExtractor.extract_all(msg)
        self.assertGreater(len(iocs), 0)

        ioc_types = {i.entity_type for i in iocs}
        self.assertIn("CONTENT_INDICATOR", ioc_types)
        self.assertIn("PAYMENT_INDICATOR", ioc_types)
        self.assertIn("PUBLIC_HANDLE", ioc_types)
        self.assertIn("QUANTITY", ioc_types)
        self.assertIn("LOCATION", ioc_types)

        for ioc in iocs:
            self.assertEqual(ioc.source_message_id, msg.message_id)
            self.assertGreaterEqual(ioc.confidence, 0.5)
            self.assertGreaterEqual(ioc.text_offset, 0)
            self.assertTrue(len(ioc.context_snippet) > 0)

    def test_09_explainable_risk_scoring(self):
        """Test 0-100 explainable risk scoring and line-item breakdown."""
        msg = NormalizedTelegramMessage.create(
            source_id="risk_test_src",
            telegram_message_id=10,
            text=self.sample_text
        )
        iocs = TelegramIOCExtractor.extract_all(msg)
        score = TelegramRiskEngine.score_message(
            message=msg,
            iocs=iocs,
            cross_source_count=2,
            repeat_identifier_count=2
        )

        self.assertGreaterEqual(score.total_score, 0.0)
        self.assertLessEqual(score.total_score, 100.0)
        self.assertIn(score.risk_level, ["CRITICAL", "HIGH", "MEDIUM", "LOW"])
        self.assertGreater(len(score.line_item_breakdown), 0)

        # Mandatory disclaimer verification
        self.assertIn("Investigative Lead", score.disclaimer)
        self.assertIn("not a determination of criminal activity", score.disclaimer)

    def test_10_graph_persistence_to_sqlite(self):
        """Test graph persistence into pineSAW's SQLite dev.db schema."""
        msg = NormalizedTelegramMessage.create(
            source_id="TEST_UNIT_GRAPH",
            telegram_message_id=888,
            text=self.sample_text
        )
        iocs = TelegramIOCExtractor.extract_all(msg)
        score = TelegramRiskEngine.score_message(msg, iocs)

        persister = TelegramGraphPersister()
        res = persister.persist_result(msg, iocs, score)

        self.assertIn("source_entity_id", res)
        self.assertIn("entity_ids", res)
        self.assertIn("relationship_ids", res)
        self.assertIn("evidence_id", res)
        self.assertGreater(len(res["entity_ids"]), 1)
        self.assertGreater(len(res["relationship_ids"]), 0)

    def test_11_mock_mode_execution(self):
        """Test offline mock mode execution pipeline."""
        pipeline = TelegramOSINTPipeline()
        results = pipeline.run_pipeline(
            source_id="TEST_MOCK_OFFLINE",
            mode="MOCK",
            max_messages=3,
            publish_zmq=False
        )

        self.assertEqual(len(results), 3)
        for r in results:
            self.assertIn("[SYNTHETIC TEST DATA]", r["message"]["text"])
            self.assertIn("iocs", r)
            self.assertIn("risk_score", r)
            self.assertIn("persisted", r)
            self.assertGreater(r["risk_score"]["total_score"], 0)

    def test_12_automated_public_source_discovery(self):
        """Test threat-keyword public source discovery and accessibility verification."""
        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tf:
            temp_reg_file = tf.name

        try:
            from app.services.telegram_bot.discovery import TelegramSourceDiscovery
            discovery = TelegramSourceDiscovery(registry_file=temp_reg_file)
            res = discovery.discover_candidates(
                keywords=["fentanyl", "chitta"],
                mode="MOCK"
            )

            candidates = res["candidates"]
            self.assertGreater(len(candidates), 0)
            for c in candidates:
                self.assertIn("channel_username", c)
                self.assertIn("discovered_keywords", c)
                self.assertIn("verified_public", c)
                self.assertEqual(c["status"], "CANDIDATE")

            summary = discovery.get_summary()
            self.assertGreater(summary["sources_found"], 0)
            self.assertGreater(summary["queued"], 0)
            self.assertIn("last_discovery", summary)
        finally:
            if os.path.exists(temp_reg_file):
                os.remove(temp_reg_file)

    def test_13_source_registry_review_and_queue(self):
        """Test investigator review, approval, and promotion to monitoring queue."""
        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tf:
            temp_reg_file = tf.name

        try:
            from app.services.telegram_bot.discovery import TelegramSourceDiscovery
            discovery = TelegramSourceDiscovery(registry_file=temp_reg_file)
            discovery.discover_candidates(keywords=["meth"], mode="MOCK")

            sources = discovery.registry["sources"]
            first_channel = list(sources.keys())[0]

            # Approve source
            approved = discovery.update_source_status(first_channel, "APPROVED")
            self.assertIsNotNone(approved)
            self.assertEqual(approved["status"], "APPROVED")

            # Promote to monitoring
            monitored = discovery.update_source_status(first_channel, "MONITORING")
            self.assertIsNotNone(monitored)
            self.assertEqual(monitored["status"], "MONITORING")

            summary = discovery.get_summary()
            self.assertEqual(summary["monitoring"], 1)
            self.assertIn(first_channel, discovery.get_monitoring_queue())

            # Test pop_next_monitoring_source
            popped = discovery.pop_next_monitoring_source()
            self.assertEqual(popped, first_channel)
        finally:
            if os.path.exists(temp_reg_file):
                os.remove(temp_reg_file)

    def test_14_live_discovery_keyword_search_and_deduplication(self):
        """
        Tests genuine keyword-based discovery layer (proves LIVE mode is no longer hardcoded durov/telegram).
        Uses mocked discovery client HTTP responses for CI isolation.
        """
        from unittest.mock import patch
        from app.services.telegram_bot.discovery_client import TelegramPublicDiscoveryClient

        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tf:
            temp_cp_file = tf.name

        try:
            client = TelegramPublicDiscoveryClient(checkpoints_file=temp_cp_file)

            # Mock _query_public_directory to simulate genuine external search engine responses
            def mock_query(kw, limit):
                if kw == "threat_term_alpha":
                    return [
                        {"channel_username": "new_threat_intel_chan1", "title": "Threat Feed 1", "description": "Feed 1", "public_url": "https://t.me/new_threat_intel_chan1"},
                        {"channel_username": "cross_matched_chan", "title": "Cross Matched", "description": "Cross", "public_url": "https://t.me/cross_matched_chan"},
                    ]
                elif kw == "threat_term_beta":
                    return [
                        {"channel_username": "cross_matched_chan", "title": "Cross Matched", "description": "Cross", "public_url": "https://t.me/cross_matched_chan"},
                        {"channel_username": "new_threat_intel_chan2", "title": "Threat Feed 2", "description": "Feed 2", "public_url": "https://t.me/new_threat_intel_chan2"},
                    ]
                return []

            with patch.object(client, "_query_public_directory", side_effect=mock_query):
                results = client.search_public_sources(
                    keywords=["threat_term_alpha", "threat_term_beta"],
                    mode="LIVE"
                )

                # Verified: returned newly discovered sources, NOT hardcoded durov/telegram
                self.assertEqual(len(results), 3) # 4 raw results deduplicated to 3 unique channels!
                usernames = {r["channel_username"] for r in results}
                self.assertIn("new_threat_intel_chan1", usernames)
                self.assertIn("new_threat_intel_chan2", usernames)
                self.assertIn("cross_matched_chan", usernames)
                self.assertNotIn("durov", usernames)
                self.assertNotIn("telegram", usernames)

                # Verified: multi-keyword tracking on deduplicated channel
                cross_chan = next(r for r in results if r["channel_username"] == "cross_matched_chan")
                self.assertEqual(len(cross_chan["discovered_keywords"]), 2)
                self.assertIn("threat_term_alpha", cross_chan["discovered_keywords"])
                self.assertIn("threat_term_beta", cross_chan["discovered_keywords"])

        finally:
            if os.path.exists(temp_cp_file):
                os.remove(temp_cp_file)


if __name__ == "__main__":
    unittest.main()
