from datetime import datetime
import math
from collections import Counter

class BehaviorExtractor:
    @staticmethod
    def extract_features(events: list) -> dict:
        """
        Extract behavioral features given a list of chronological events for an entity.
        events: list of dicts with 'timestamp', 'platform', 'content'
        """
        if not events:
            return {'confidence': 0.0, 'observation_count': 0}
            
        events_sorted = sorted(events, key=lambda x: x['timestamp'])
        
        # Interval analysis
        intervals = []
        for i in range(1, len(events_sorted)):
            delta = events_sorted[i]['timestamp'] - events_sorted[i-1]['timestamp']
            intervals.append(delta.total_seconds())
            
        median_interval = 0
        interval_variance = 0.0
        burstiness = 0.0
        
        if intervals:
            intervals.sort()
            mid = len(intervals) // 2
            median_interval = intervals[mid]
            
            mean = sum(intervals) / len(intervals)
            if len(intervals) > 1:
                interval_variance = sum((x - mean) ** 2 for x in intervals) / (len(intervals) - 1)
                std_dev = math.sqrt(interval_variance)
                if mean > 0:
                    burstiness = std_dev / mean
                
        # Diversity metrics (Entropy)
        platforms = [e.get('platform', 'unknown') for e in events]
        platform_counts = Counter(platforms)
        platform_entropy = 0.0
        for count in platform_counts.values():
            p = count / len(events)
            platform_entropy -= p * math.log2(p)
            
        # Active hours
        active_hours = list(set(e['timestamp'].hour for e in events if 'timestamp' in e and e['timestamp']))
        
        # Confidence
        obs_count = len(events)
        confidence = min(1.0, obs_count / 20.0) # 20 events is high confidence
        
        return {
            'observation_count': obs_count,
            'behavior_confidence': confidence,
            'median_interval_sec': median_interval,
            'burstiness': burstiness,
            'platform_entropy': platform_entropy,
            'active_hours': active_hours
        }

    @staticmethod
    def compare_profiles(prof_a: dict, prof_b: dict) -> float:
        # If either has insufficient data, return neutral score
        if not prof_a or not prof_b:
            return 0.5
            
        conf_a = prof_a.get('behavior_confidence', 0.0)
        conf_b = prof_b.get('behavior_confidence', 0.0)
        
        # If both have very low confidence, don't penalize or reward much
        if conf_a < 0.1 or conf_b < 0.1:
            return 0.5
            
        score = 1.0
        
        # Compare burstiness
        b_a = prof_a.get('burstiness', 0.0)
        b_b = prof_b.get('burstiness', 0.0)
        diff_b = abs(b_a - b_b)
        score -= min(0.3, diff_b / 5.0) # Penalty up to 0.3
        
        # Compare entropy
        e_a = prof_a.get('platform_entropy', 0.0)
        e_b = prof_b.get('platform_entropy', 0.0)
        diff_e = abs(e_a - e_b)
        score -= min(0.3, diff_e / 2.0)
        
        # Active hours intersection (Jaccard)
        h_a = set(prof_a.get('active_hours', []))
        h_b = set(prof_b.get('active_hours', []))
        
        if h_a and h_b:
            intersection = len(h_a.intersection(h_b))
            union = len(h_a.union(h_b))
            jaccard = intersection / union
            # Reward high overlap, penalize low
            score -= (1.0 - jaccard) * 0.4
        else:
            score -= 0.2
        
        return max(0.0, score)
