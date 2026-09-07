import json
import requests
import time

def replay_data():
    with open('artifacts/demo_data.json', 'r') as f:
        events = json.load(f)
        
    print(f"Replaying {len(events)} events...")
    
    for event in events:
        response = requests.post("http://localhost:8000/api/ingest", json=event)
        if response.status_code == 200:
            res_data = response.json()
            print(f"[{event['timestamp']}] Event {event['event_id'][:8]} ingested | Risk: {res_data.get('anomaly_score', 0):.2f} | Entities: {res_data.get('extracted_entities', 0)} | Potential Links: {res_data.get('potential_links', 0)}")
        else:
            print(f"Failed to ingest event {event['event_id']}: {response.text}")
        
        # Artificial delay for demo
        # time.sleep(0.5)

if __name__ == "__main__":
    replay_data()
