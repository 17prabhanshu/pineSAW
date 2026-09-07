import math
from collections import Counter
import string

class StylometryExtractor:
    # Top function words for English
    FUNCTION_WORDS = set(['the', 'and', 'to', 'of', 'a', 'in', 'i', 'that', 'it', 'for', 'you', 'is', 'on', 'with'])
    
    @staticmethod
    def extract_features(text: str) -> dict:
        if not text:
            return {}
            
        features = {}
        
        # 1. Length statistics
        features['char_count'] = len(text)
        words = text.lower().split()
        features['word_count'] = len(words)
        features['sentence_count'] = text.count('.') + text.count('!') + text.count('?')
        features['sentence_count'] = max(1, features['sentence_count'])
        features['avg_words_per_sentence'] = features['word_count'] / features['sentence_count']
        
        # 2. Lexical diversity (Type-Token Ratio)
        if features['word_count'] > 0:
            features['ttr'] = len(set(words)) / features['word_count']
        else:
            features['ttr'] = 0.0
            
        # 3. Capitalization pattern
        upper_chars = sum(1 for c in text if c.isupper())
        features['upper_ratio'] = upper_chars / max(1, len(text))
        
        # 4. Punctuation Profile
        punct_counts = Counter(c for c in text if c in string.punctuation)
        total_punct = sum(punct_counts.values())
        features['punct_ratio'] = total_punct / max(1, len(text))
        features['comma_ratio'] = punct_counts.get(',', 0) / max(1, total_punct)
        
        # 5. Function-word distribution
        fw_count = sum(1 for w in words if w in StylometryExtractor.FUNCTION_WORDS)
        features['function_word_ratio'] = fw_count / max(1, features['word_count'])
        
        # 6. Emoji distribution
        emoji_count = sum(1 for c in text if ord(c) > 127) # simplified
        features['emoji_ratio'] = emoji_count / max(1, len(text))
        
        # 7. Character 3-grams (hashed to a small vector space or just kept as counts)
        # For simplicity, we just use a small summary statistic: average word length
        avg_word_len = sum(len(w) for w in words) / max(1, features['word_count'])
        features['avg_word_len'] = avg_word_len
        
        return features

    @staticmethod
    def extract_aggregate_profile(texts: list[str]) -> dict:
        if not texts:
            return {"confidence": 0.0, "observation_count": 0}
            
        full_text = " ".join(texts)
        profile = StylometryExtractor.extract_features(full_text)
        
        # Calculate confidence based on sample size (e.g., >1000 chars is high confidence)
        char_count = profile.get('char_count', 0)
        confidence = min(1.0, char_count / 1000.0)
        
        profile['observation_count'] = len(texts)
        profile['stylometry_confidence'] = confidence
        
        # Add character n-grams
        char_3grams = [full_text[i:i+3] for i in range(len(full_text)-2)]
        top_ngrams = [k for k, v in Counter(char_3grams).most_common(20)]
        profile['top_3grams'] = top_ngrams
        
        return profile

    @staticmethod
    def compare_profiles(prof_a: dict, prof_b: dict) -> float:
        if not prof_a or not prof_b: return 0.5
        
        keys = ['ttr', 'upper_ratio', 'punct_ratio', 'comma_ratio', 'function_word_ratio', 'emoji_ratio', 'avg_words_per_sentence']
        dist = 0.0
        valid_keys = 0
        
        for k in keys:
            val_a = prof_a.get(k, 0.0)
            val_b = prof_b.get(k, 0.0)
            if k == 'avg_words_per_sentence':
                max_diff = 50.0
                diff = min(abs(val_a - val_b), max_diff) / max_diff
            else:
                diff = abs(val_a - val_b)
                
            dist += diff ** 2
            valid_keys += 1
            
        # Jaccard on character n-grams
        ngrams_a = set(prof_a.get('top_3grams', []))
        ngrams_b = set(prof_b.get('top_3grams', []))
        if ngrams_a and ngrams_b:
            intersection = len(ngrams_a.intersection(ngrams_b))
            union = len(ngrams_a.union(ngrams_b))
            ngram_sim = intersection / union
        else:
            ngram_sim = 0.5
            
        dist = math.sqrt(dist) if valid_keys > 0 else 0
        max_dist = math.sqrt(valid_keys)
        
        # Base scalar score
        base_score = max(0.0, 1.0 - (dist / (max_dist * 0.5)))
        
        # Blend in ngram similarity
        final_score = (base_score * 0.7) + (ngram_sim * 0.3)
        return final_score
