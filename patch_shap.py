import re

with open('src/components/ExplainabilityPanel.tsx', 'r') as f:
    content = f.read()

# Modify the header
content = content.replace('<h2 className="text-xl font-bold font-display text-white">Risk Explainability</h2>', 
'<h2 className="text-xl font-bold font-display text-white">SHAP Feature Attribution</h2>')

content = content.replace('<p className="text-sm text-zinc-400 font-mono mt-1">AI Decision Confidence: {(confidence * 100).toFixed(0)}%</p>',
'<p className="text-sm text-zinc-400 font-mono mt-1">GNN Node Classification Confidence: {(confidence * 100).toFixed(0)}%</p>')

with open('src/components/ExplainabilityPanel.tsx', 'w') as f:
    f.write(content)
