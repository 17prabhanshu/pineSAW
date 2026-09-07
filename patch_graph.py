import re

with open('src/components/NetworkGraph.tsx', 'r') as f:
    content = f.read()

content = content.replace("INITIALIZING INSTITUTIONAL GRAPH ENGINE...", "INITIALIZING GNN-POWERED PROPERTY GRAPH...")
content = content.replace("Additional Properties", "GNN Node Features")

with open('src/components/NetworkGraph.tsx', 'w') as f:
    f.write(content)
