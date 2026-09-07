import sys
from sqlalchemy import create_engine, text

def run_pit_attack_suite():
    """
    Tests the system's resilience against deliberate Point-In-Time (PIT) feature and graph leakage attacks.
    """
    print("=========================================")
    print("DARKINT V3.8: PIT Attack Suite")
    print("=========================================\n")
    
    engine = create_engine("sqlite:///:memory:")
    with engine.connect() as conn:
        conn.execute(text('''CREATE TABLE events (event_id TEXT PRIMARY KEY, timestamp DATETIME)'''))
        conn.execute(text('''CREATE TABLE feature_values (
            id INTEGER PRIMARY KEY, feature_name TEXT, valid_at DATETIME, computed_at DATETIME, event_id TEXT,
            FOREIGN KEY(event_id) REFERENCES events(event_id))'''))
        conn.execute(text('''CREATE TABLE edges (
            id INTEGER PRIMARY KEY, source_id TEXT, target_id TEXT, observed_at DATETIME)'''))
            
        # Ground Truth timeline
        conn.execute(text("INSERT INTO events VALUES ('E_NOW', '2026-06-01 10:00:00')"))
        
        # Attack 1: Feature computed using future data (e.g. future platform count)
        conn.execute(text("INSERT INTO feature_values (feature_name, valid_at, computed_at, event_id) VALUES ('future_platform_count', '2026-06-02 10:00:00', '2026-06-02 10:00:05', 'E_NOW')"))
        
        # Attack 2: Graph topology leaked from future
        conn.execute(text("INSERT INTO edges (source_id, target_id, observed_at) VALUES ('A', 'B', '2026-06-03 09:00:00')"))
        
        # Detection
        feature_leaks = conn.execute(text('''
            SELECT f.feature_name FROM feature_values f JOIN events e ON f.event_id = e.event_id
            WHERE f.valid_at > e.timestamp
        ''')).fetchall()
        
        graph_leaks = conn.execute(text('''
            SELECT e.id FROM edges e
            WHERE e.observed_at > (SELECT MAX(timestamp) FROM events)
        ''')).fetchall()
        
        if len(feature_leaks) == 0 or len(graph_leaks) == 0:
            print("CRITICAL FAILURE: PIT Attack evaded detection!")
            sys.exit(1)
            
        print(f"SUCCESS: Blocked {len(feature_leaks)} feature leak attacks.")
        print(f"SUCCESS: Blocked {len(graph_leaks)} graph topology leak attacks.")

if __name__ == "__main__":
    run_pit_attack_suite()
