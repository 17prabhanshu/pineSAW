import json
import uuid
from datetime import datetime, timedelta
import random
import os

def generate_synthetic_data(num_events=50):
    events = []
    base_time = datetime.utcnow() - timedelta(days=30)
    
    vendors = [
        {"raw_id": "vendor_23", "display_name": "Vendor_23", "risk_base": 0.8},
        {"raw_id": "vendor_41", "display_name": "Vendor_41", "risk_base": 0.4},
        {"raw_id": "v_xpress", "display_name": "v_xpress", "risk_base": 0.9}, # Potential alias of vendor_23
        {"raw_id": "benign_user", "display_name": "Health_Advocate", "risk_base": 0.1}
    ]
    
    products = [
        "OxyContin 80mg", "Fentanyl Patches", "Xanax 2mg", "Adderall 30mg", "MDMA Crystal", 
        "Clean testing kits", "Harm reduction guide"
    ]
    
    platforms = ["market_A", "market_B", "forum_C"]
    
    for i in range(num_events):
        vendor = random.choice(vendors)
        platform = random.choice(platforms)
        
        event_time = base_time + timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
        
        is_sale = random.random() < vendor["risk_base"]
        
        if is_sale:
            product = random.choice(products[:-2])
            text = f"Top quality {product} for sale. Fast shipping, stealth packaging. Wickr me at {vendor['display_name']}_deals."
        else:
            product = random.choice(products[-2:])
            text = f"Always test your substances. Get {product} here. Stay safe."
            
        event = {
            "event_id": f"EVT-{uuid.uuid4().hex[:8]}",
            "source": "synthetic_demo",
            "platform_type": "darknet_market" if "market" in platform else "darknet_forum",
            "platform_id": platform,
            "timestamp": event_time.isoformat() + "Z",
            "actor": {
                "raw_id": vendor["raw_id"],
                "display_name": vendor["display_name"]
            },
            "content": {
                "text": text,
                "language": "en",
                "image_refs": []
            },
            "entities": [],
            "financial": [],
            "location": None,
            "provenance": {
                "source_uri": f"synthetic://{platform}/{uuid.uuid4().hex[:8]}",
                "dataset": "demo_v1"
            }
        }
        events.append(event)
        
    events.sort(key=lambda x: x["timestamp"])
    return events

if __name__ == "__main__":
    os.makedirs("artifacts", exist_ok=True)
    data = generate_synthetic_data(100)
    with open("artifacts/demo_data.json", "w") as f:
        json.dump(data, f, indent=2)
    print(f"Generated {len(data)} synthetic events in artifacts/demo_data.json")
