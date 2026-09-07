import re

with open('src/app/search/page.tsx', 'r') as f:
    content = f.read()

content = content.replace("Cross-Network Entity & Investigation Query", "FAISS + BM25 Hybrid Retrieval // Cross-Network Semantic Query")

with open('src/app/search/page.tsx', 'w') as f:
    f.write(content)
