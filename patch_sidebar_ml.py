import re

with open('src/components/Sidebar.tsx', 'r') as f:
    content = f.read()

# Change Global Search to FAISS Vector Search
content = content.replace('"Global Search"', '"FAISS Vector Search"')

# Change Tor & NLP Ingestion to AIL / ZeroMQ Ingestion
content = content.replace('"Tor & NLP Ingestion"', '"AIL / ZeroMQ Streams"')

with open('src/components/Sidebar.tsx', 'w') as f:
    f.write(content)
