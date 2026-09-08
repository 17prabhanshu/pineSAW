import http.server
import json
import random
import time
import sys
from datetime import datetime

sys.path.append("backend")
try:
    from app.services.ingestion.zmq_broker import zmq_broker
    print("[INIT] Real TCP ZeroMQ Broker initialized on ports 5556-5561")
except Exception as e:
    print(f"[WARN] ZeroMQ Broker init: {e}")

TEMPLATES = [
    {
        "socket": "tcp://127.0.0.1:5556",
        "channel": "darknet.tor.bohemia.vendor",
        "source": "AIL Lacus Headless Crawler #1",
        "headline": "Encrypted PGP proof of reserve broadcasted by vendor 'ChemicalKing'",
        "iocs": [{"type": "VENDOR", "value": "ChemicalKing"}, {"type": "ONION", "value": "bohemiadark8x9a.onion"}],
        "rawHex": "41 49 4c 01 70 67 70 5f 70 72 6f 6f 66 5f 72 65 73 65 72 76 65",
        "rawJson": {"vendor": "ChemicalKing", "market": "Bohemia", "rating": "4.98/5", "listings_active": 84},
        "riskLevel": "HIGH"
    },
    {
        "socket": "tcp://127.0.0.1:5557",
        "channel": "darknet.telegram.c2.channel",
        "source": "AIL Telegram Telethon Ingestor",
        "headline": "Darknet marketplace mirror link published in channel @archetyp_backup",
        "iocs": [{"type": "TELEGRAM", "value": "@archetyp_backup"}, {"type": "MIRROR", "value": "archetypmirror4.onion"}],
        "rawHex": "54 47 5f 4d 49 52 52 4f 52 5f 50 4f 53 54 20 6f 6e 69 6f 6e",
        "rawJson": {"channel": "@archetyp_backup", "subscribers": 14820, "verified_admin_pgp": True},
        "riskLevel": "MEDIUM"
    },
    {
        "socket": "tcp://127.0.0.1:5558",
        "channel": "darknet.crypto.mempool.peeling",
        "source": "AIL ZeroMQ BTC FullNode Sub",
        "headline": "High-value peel detected: 8.42 BTC split into 12 unspent dust utxos",
        "iocs": [{"type": "BTC", "value": "bc1q84z9...09ea"}, {"type": "METHOD", "value": "CoinJoin Whirlpool"}],
        "rawHex": "02 00 00 00 04 89 f1 09 bc 1q 84 z9",
        "rawJson": {"amount_btc": 8.42, "utxos": 12, "flagged_under": "NDPS_SEC_68F"},
        "riskLevel": "CRITICAL"
    },
    {
        "socket": "tcp://127.0.0.1:5559",
        "channel": "darknet.pastebin.leak.credential",
        "source": "CIRCL AIL Paste Monitor",
        "headline": "Data Leak: 50,000+ Indian banking credentials (HDFC, SBI) detected in paste dump",
        "iocs": [{"type": "BIN", "value": "Pastebin"}, {"type": "BANK", "value": "HDFC/SBI"}],
        "rawHex": "43 49 52 43 4c 5f 50 41 53 54 45 5f 4c 45 41 4b",
        "rawJson": {"records": 52401, "country_target": "India", "password_hashes": "bcrypt/md5", "verified": True},
        "riskLevel": "CRITICAL"
    },
    {
        "socket": "tcp://127.0.0.1:5560",
        "channel": "darknet.tor.pgp.extracted",
        "source": "CIRCL AIL PGP Extractor Module",
        "headline": "New PGP Identity Cross-Match: Vendor 'ShadowBroker' key matches Telegram user",
        "iocs": [{"type": "PGP_FINGERPRINT", "value": "0x4A8B9C2D..."}, {"type": "TELEGRAM", "value": "@shadow_broker_t"}],
        "rawHex": "50 47 50 5f 43 52 4f 53 53 4d 41 54 43 48 5f 46 4f 55 4e 44",
        "rawJson": {"key_length": 4096, "creation_date": "2024-01-12", "match_confidence": 0.99, "linked_identities": 2},
        "riskLevel": "CRITICAL"
    },
    {
        "socket": "tcp://127.0.0.1:5561",
        "channel": "darknet.financial.cards.dump",
        "source": "CIRCL AIL CC Dumps Parser",
        "headline": "Joker's Stash Mirror Update: 2,500 fresh Track 2 Visa CVV dumps added",
        "iocs": [{"type": "CARDING", "value": "Visa/MC"}, {"type": "MARKET", "value": "Jokers Stash"}],
        "rawHex": "54 52 41 43 4b 32 5f 44 55 4d 50 5f 56 49 53 41",
        "rawJson": {"card_type": "Visa", "qty": 2500, "price_per_card": "$12", "avg_balance": "Unknown"},
        "riskLevel": "HIGH"
    }
]

class SSEHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/zmq_stream":
            self.send_response(200)
            self.send_header('Content-type', 'text/event-stream')
            self.send_header('Cache-Control', 'no-cache')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            import sys
            sys.path.append("backend")
            from app.services.ingestion.zmq_broker import ZmqSubscriberBridge
            self.wfile.write(b": connected to real zmq tcp bus\n\n")
            self.wfile.flush()
            subscriber = ZmqSubscriberBridge()
            try:
                for msg in subscriber.listen_events():
                    if msg is not None:
                        self.wfile.write(f"data: {json.dumps(msg)}\n\n".encode())
                        self.wfile.flush()
            except (BrokenPipeError, ConnectionResetError):
                pass
        elif self.path.startswith("/api/search"):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            resp = {
                "entities": [
                    {"id": "sim_1", "type": "WALLET", "label": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"},
                    {"id": "sim_2", "type": "IDENTIFIER", "label": "shadow_broker_backup@proton.me"},
                    {"id": "sim_3", "type": "PLATFORM", "label": "Alphabay Market"}
                ]
            }
            self.wfile.write(json.dumps(resp).encode())
        elif self.path == "/api/telegram_osint/status":
            import sys
            sys.path.append("backend")
            from app.services.telegram_bot import get_pipeline
            pipeline = get_pipeline()
            st = pipeline.get_status()
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(st.dict()).encode())
        elif self.path == "/api/telegram_osint/sources":
            import sys
            sys.path.append("backend")
            from app.services.telegram_bot import get_pipeline
            pipeline = get_pipeline()
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(pipeline.collector.checkpoints).encode())
        elif self.path == "/api/telegram_osint/keywords":
            import sys
            sys.path.append("backend")
            from app.services.telegram_bot.config import THREAT_KEYWORDS
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(THREAT_KEYWORDS).encode())
        elif self.path == "/api/telegram_osint/discovery":
            import sys
            sys.path.append("backend")
            from app.services.telegram_bot import discovery_service
            summary = discovery_service.get_summary()
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(summary).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == "/api/parse_text":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            
            import sys
            sys.path.append("backend")
            from app.services.financial.chain_tracker import extract_and_trace_wallets
            from app.services.nlp.classifier import classify_text, extract_entities
            
            try:
                data = json.loads(post_data)
                text = data.get("text", "")
            except:
                text = post_data
                
            classification = classify_text(text)
            entities = extract_entities(text)
            chain_traces = extract_and_trace_wallets(text)
            
            resp = {
                "classification": classification,
                "entities": entities,
                "chain_traces": chain_traces
            }
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(resp).encode())
        elif self.path == "/api/legal/draft_request":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(post_data)
            
            import uuid
            import datetime
            
            req_id = f"REQ-BANK-{uuid.uuid4().hex[:6].upper()}"
            date_str = datetime.datetime.now().strftime("%d-%b-%Y")
            label = data.get("label", "Unknown")
            
            draft = f"CONFIDENTIAL / LAW ENFORCEMENT ONLY\nDate: {date_str}\nRef: {req_id}\n\nTo: Nodal Officer, Financial Intelligence Unit (FIU-IND)\nSub: Requisition for KYC and Transaction Records under Section 91 Cr.P.C.\n\nPlease provide complete Account Opening Forms (AOF), KYC documents, and itemized ledger statements from 01-Jan-2025 to date for any accounts associated with the entity known as '{label}'.\n\nThis information is required in connection with an ongoing investigation into illicit darknet marketplace narcotics distribution networks.\n\nAuthorized by:\nCyber Crime Cell, Chandigarh Police\n"
            
            resp = {
                "status": "success",
                "request_id": req_id,
                "document_type": "Cr.P.C. 91 Requisition",
                "draft_content": draft
            }
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(resp).encode())
        elif self.path == "/api/zmq_publish":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(post_data)
            
            import sys
            sys.path.append("backend")
            from app.services.ingestion.zmq_broker import zmq_broker
            
            port = str(data.get("port", "5557"))
            zmq_broker.publish_message(port, data)
            
            resp = {"status": "published_over_tcp", "socket": f"tcp://127.0.0.1:{port}"}
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(resp).encode())
        elif self.path == "/api/telegram_osint/command":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(post_data)
            cmd = data.get("command", "/help")
            user_id = data.get("user_id", "admin")
            args = data.get("args", [])
            
            import sys
            sys.path.append("backend")
            from app.services.telegram_bot import TelegramBotCommandHandler
            res = TelegramBotCommandHandler.handle_command(cmd, user_id, args)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(res).encode())
        elif self.path == "/api/telegram_osint/collect":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(post_data)
            source_id = data.get("source_id") or (data.get("sources")[0] if (data.get("sources") and isinstance(data.get("sources"), list)) else "@tri_city_dead_drops")
            mode = data.get("mode", "LIVE")
            max_messages = int(data.get("max_messages", 5))
            ignore_checkpoint = bool(data.get("ignore_checkpoint", False))
            
            import sys
            sys.path.append("backend")
            from app.services.telegram_bot import get_pipeline
            pipeline = get_pipeline()
            results = pipeline.run_pipeline(source_id=source_id, mode=mode, max_messages=max_messages, ignore_checkpoint=ignore_checkpoint)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "SUCCESS", "count": len(results), "results": results}).encode())
        elif self.path == "/api/telegram_osint/discover":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(post_data) if post_data else {}
            keywords = data.get("keywords")
            mode = data.get("mode", "MOCK")
            
            import sys
            sys.path.append("backend")
            from app.services.telegram_bot import discovery_service
            candidates = discovery_service.discover_candidates(keywords=keywords, mode=mode)
            summary = discovery_service.get_summary()
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "SUCCESS", "count": len(candidates), "candidates": candidates, "summary": summary}).encode())
        elif self.path == "/api/telegram_osint/review_source":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(post_data)
            channel = data.get("channel_username", "")
            new_status = data.get("status", "APPROVED")
            
            import sys
            sys.path.append("backend")
            from app.services.telegram_bot import discovery_service
            updated = discovery_service.update_source_status(channel, new_status)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "SUCCESS" if updated else "NOT_FOUND", "source": updated}).encode())
        elif self.path == "/api/financial/wallet-analyze":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(post_data)
            wallet = data.get("wallet", "").strip()
            
            import sys
            sys.path.append("backend")
            from app.services.financial.chain_tracker import generate_risk_report
            report = generate_risk_report(wallet)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "SUCCESS", "report": report}).encode())
        elif self.path == "/api/ingest/semantic-scrape":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(post_data)
            url = data.get("url", "").strip()
            extract_targeted = data.get("extract_targeted", False)
            
            import sys
            sys.path.append("backend")
            from app.services.ingestion.semantic_scraper import SemanticWebScraper
            result = SemanticWebScraper.scrape_url(url, extract_targeted=extract_targeted)
            
            self.send_response(200 if result.get("success") else 400)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
        elif self.path == "/api/ingest/vendor-link-similarity":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(post_data)
            text_a = data.get("text_a", "")
            text_b = data.get("text_b", "")
            
            import sys
            sys.path.append("backend")
            from app.services.nlp.vendor_link_bridge import vendor_link
            similarity = vendor_link.compute_stylometric_similarity(text_a, text_b)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": True, 
                "similarity_score": similarity,
                "model_used": "VendorLink_BERT" if vendor_link.model_loaded else "VendorLink_Heuristic_Fallback"
            }).encode())
        else:
            self.send_response(404)
            self.end_headers()
            
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-type, x-api-key")
        self.end_headers()

if __name__ == '__main__':
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 8000), SSEHandler)
    server.serve_forever()
