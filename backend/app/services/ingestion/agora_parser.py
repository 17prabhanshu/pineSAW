import os
import csv
import uuid
import datetime
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.domain import NormalizedEvent, Actor, Content, Provenance
from app.api.routes import ingest_event
import time

def ingest_agora_data(limit=1000):
    csv_path = os.path.join(os.path.dirname(__file__), "../../../../data/raw_external/Agora.csv")
    if not os.path.exists(csv_path):
        print(f"File not found: {csv_path}")
        return {"status": "error", "message": "Agora.csv not found"}
        
    db = SessionLocal()
    count = 0
    start_time = time.time()
    
    try:
        with open(csv_path, "r", encoding="utf-8", errors="replace") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if count >= limit:
                    break
                    
                vendor = row.get("Vendor", "").strip() or row.get(" Vendor", "").strip() or "Unknown"
                item = row.get("Item", "").strip() or row.get(" Item", "").strip()
                desc = row.get("Item Description", "").strip() or row.get(" Item Description", "").strip()
                
                # 1.5 Detect byte-level corruption
                corruption_flag = False
                if "\ufffd" in vendor or "\ufffd" in item or "\ufffd" in desc:
                    corruption_flag = True
                    print(f"WARNING: Row {count} contained byte-level encoding corruption.")
                
                if not vendor or not desc:
                    continue
                
                content_text = f"Title: {item}\nDescription: {desc}"
                
                event = NormalizedEvent(
                    event_id=f"AGORA-{uuid.uuid4().hex[:8]}",
                    source="AgoraMarket",
                    platform_type="darknet_market",
                    platform_id="agora",
                    timestamp=datetime.datetime.utcnow(),
                    actor=Actor(raw_id=vendor, display_name=vendor),
                    content=Content(text=content_text),
                    provenance=Provenance(source_uri="kaggle/agora", dataset="agora_2014_2015", data_integrity_flags={"corrupted_bytes": corruption_flag})
                )
                
                # Use the core logic
                try:
                    ingest_event(event, db)
                    db.commit()
                    count += 1
                except Exception as e:
                    db.rollback()
                    print(f"Error ingesting row {count}: {e}")
                    
        elapsed = time.time() - start_time
        return {"status": "success", "ingested": count, "time_seconds": round(elapsed, 2)}
        
    finally:
        db.close()

if __name__ == "__main__":
    print("Ingesting 100 rows for test...")
    res = ingest_agora_data(100)
    print(res)
