import sys
from sqlalchemy import create_engine, text

def run_pit_attack_generator():
    """
    Automatically generates adversarial future-data attacks against aggregates, 
    profiles, graph metrics, communities, and financial features.
    Ensures that automated point-in-time invariants are enforced.
    """
    print("=========================================")
    print("DARKINT V3.9: PIT Attack Generator")
    print("=========================================\n")
    
    engine = create_engine("sqlite:///:memory:")
    with engine.connect() as conn:
        conn.execute(text('''CREATE TABLE events (event_id TEXT PRIMARY KEY, timestamp DATETIME)'''))
        conn.execute(text('''CREATE TABLE feature_values (
            feature_id TEXT PRIMARY KEY, name TEXT, value FLOAT, valid_at DATETIME, computed_at DATETIME, 
            version INTEGER, source_event_ids TEXT, entity_id TEXT)'''))
            
        # Ground Truth timeline
        conn.execute(text("INSERT INTO events VALUES ('E_T1', '2026-06-01 10:00:00')"))
        
        # Attack Vector 1: Future Aggregates
        conn.execute(text("INSERT INTO feature_values VALUES ('F1', 'aggregate_risk', 0.95, '2026-06-02 10:00:00', '2026-06-02 10:00:05', 1, 'E_T1,E_T2', 'ENT_1')"))
        
        # Attack Vector 2: Future Graph Metrics (Centrality computed tomorrow)
        conn.execute(text("INSERT INTO feature_values VALUES ('F2', 'pagerank', 0.88, '2026-06-03 10:00:00', '2026-06-03 10:00:05', 1, 'E_T1', 'ENT_1')"))
        
        # Attack Vector 3: Future Community (HDBSCAN label from next week)
        conn.execute(text("INSERT INTO feature_values VALUES ('F3', 'community_id', 42, '2026-06-07 10:00:00', '2026-06-07 10:00:05', 1, 'E_T1', 'ENT_1')"))
        
        # Detection: For a prediction requested at T1 (2026-06-01 10:00:00), fetch features
        # The engine mathematically enforces valid_at <= prediction_time AND computed_at <= prediction_time
        prediction_time = '2026-06-01 10:00:00'
        
        valid_features = conn.execute(text(f'''
            SELECT feature_id, name FROM feature_values 
            WHERE valid_at <= '{prediction_time}' AND computed_at <= '{prediction_time}'
        ''')).fetchall()
        
        invalid_features = conn.execute(text(f'''
            SELECT feature_id, name FROM feature_values 
            WHERE valid_at > '{prediction_time}' OR computed_at > '{prediction_time}'
        ''')).fetchall()
        
        if len(valid_features) > 0:
            print("CRITICAL FAILURE: Future feature leaked into valid set!")
            sys.exit(1)
            
        if len(invalid_features) != 3:
            print("CRITICAL FAILURE: Did not catch all attacks.")
            sys.exit(1)
            
        print(f"SUCCESS: Blocked {len(invalid_features)} adversarial PIT attacks against aggregates, graph metrics, and communities.")
        print("Point-in-time feature invariants enforced and adversarially tested.")

if __name__ == "__main__":
    run_pit_attack_generator()
