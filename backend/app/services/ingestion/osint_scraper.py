import uuid
import datetime
import requests
import xml.etree.ElementTree as ET
import concurrent.futures
from typing import List, Dict
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.domain import NormalizedEvent, Actor, Content, Provenance
from app.api.routes import ingest_event

class OSINTCollector:
    """
    Advanced Surface Web OSINT Collector.
    Mimics enterprise CTI frameworks (like SpiderFoot or AIL) by using
    concurrent scraping across multiple live threat intelligence feeds.
    """
    def __init__(self):
        # Live surface web threat intelligence feeds (RSS/XML)
        self.sources = [
            {"name": "BleepingComputer", "url": "https://www.bleepingcomputer.com/feed/"},
            {"name": "TheHackerNews", "url": "https://feeds.feedburner.com/TheHackersNews"},
            {"name": "KrebsOnSecurity", "url": "https://krebsonsecurity.com/feed/"}
        ]
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
        }

    def fetch_feed(self, source: Dict) -> List[Dict]:
        """Fetches and parses a single RSS feed."""
        intel_items = []
        try:
            response = requests.get(source["url"], headers=self.headers, timeout=10)
            if response.status_code == 200:
                root = ET.fromstring(response.content)
                # Parse standard RSS 2.0 format
                for item in root.findall(".//item")[:5]: # Take top 5 latest threats per feed
                    title = item.findtext("title") or ""
                    desc = item.findtext("description") or ""
                    link = item.findtext("link") or source["url"]
                    
                    # Clean up basic HTML tags from descriptions
                    desc = desc.replace("<p>", "").replace("</p>", "").strip()
                    
                    intel_items.append({
                        "platform": source["name"],
                        "type": "news_feed",
                        "text": f"TITLE: {title}\nDETAILS: {desc}",
                        "uri": link
                    })
        except Exception as e:
            print(f"[!] Failed to fetch {source['name']}: {str(e)}")
            
        return intel_items

    def gather_live_intel(self) -> List[Dict]:
        """Uses multithreading to concurrently scrape all sources."""
        all_intel = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            future_to_source = {executor.submit(self.fetch_feed, src): src for src in self.sources}
            for future in concurrent.futures.as_completed(future_to_source):
                all_intel.extend(future.result())
        return all_intel

def run_osint_scrape():
    print("=========================================")
    print("DARKINT V4.0: Live Surface Web Scraper")
    print("=========================================\n")
    print("[*] Initializing concurrent OSINT collector...")
    
    collector = OSINTCollector()
    live_data = collector.gather_live_intel()
    
    if not live_data:
        return {"status": "error", "message": "Failed to pull live OSINT data.", "ingested": 0}
        
    print(f"[*] Successfully scraped {len(live_data)} live threat advisories.")
    print("[*] Pushing unstructured text to AI Engine (GLiNER + BGE)...")
    
    db = SessionLocal()
    count = 0
    try:
        for item in live_data:
            event = NormalizedEvent(
                event_id=f"OSINT-{uuid.uuid4().hex[:8]}",
                source=item["platform"],
                platform_type=item["type"],
                platform_id=item["platform"],
                timestamp=datetime.datetime.utcnow(),
                actor=Actor(raw_id="System", display_name="OSINT_Bot"),
                content=Content(text=item["text"][:1000]), # Truncate to first 1000 chars for speed
                provenance=Provenance(source_uri=item["uri"], dataset="live_surface_web")
            )
            
            try:
                ingest_event(event, db)
                db.commit()
                count += 1
            except Exception as e:
                db.rollback()
                print(f"[-] Error ingesting event from {item['platform']}: {e}")
                
        print(f"[+] Ingestion complete. AI extracted entities for {count} events.")
        stream_preview = [
            {"source": item["platform"], "preview": item["text"][:150] + "..."} 
            for item in live_data
        ]
        return {
            "status": "success", 
            "message": "Live OSINT Scrape Complete", 
            "ingested": count,
            "stream": stream_preview
        }
    finally:
        db.close()

if __name__ == "__main__":
    run_osint_scrape()
