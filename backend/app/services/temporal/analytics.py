from sqlalchemy.orm import Session
from app.db.schema import Event as DBEvent
from collections import defaultdict
from datetime import timedelta

def get_temporal_risk_series(db: Session, days: int = 7):
    # Calculate daily events and average risk from the database
    # Since risk is not directly on event right now (it's on entities), we will count events
    # and look up the actors risk. But for MVP, let's just count daily events and alerts.
    
    events = db.query(DBEvent).order_by(DBEvent.timestamp).all()
    
    daily_stats = defaultdict(lambda: {"events": 0, "risk_events": 0})
    
    for ev in events:
        day_str = ev.timestamp.strftime("%Y-%m-%d") if ev.timestamp else "Unknown"
        daily_stats[day_str]["events"] += 1
        # Mocking the risk detection count by checking if vendor was extracted, 
        # in reality we'd join with the Alert table.
        
    chart_data = []
    for day, stats in sorted(daily_stats.items()):
        # Mock risk scalar for chart visualization based on event volume as a proxy
        chart_data.append({
            "name": day[-5:], # MM-DD
            "events": stats["events"],
            "risk": min(100, stats["events"] * 10) 
        })
        
    # Return last N days
    return chart_data[-days:]
