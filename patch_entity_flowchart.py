import re

with open('src/app/entities/[id]/page.tsx', 'r') as f:
    content = f.read()

# Add import
if 'import { EntityFlowchart } from "@/components/EntityFlowchart";' not in content:
    content = content.replace('import { NetworkGraph } from "@/components/NetworkGraph";', 'import { NetworkGraph } from "@/components/NetworkGraph";\nimport { EntityFlowchart } from "@/components/EntityFlowchart";')

# Replace NetworkGraph with EntityFlowchart
content = content.replace('<NetworkGraph data={graphData} />', '<EntityFlowchart data={graphData} />')

with open('src/app/entities/[id]/page.tsx', 'w') as f:
    f.write(content)
