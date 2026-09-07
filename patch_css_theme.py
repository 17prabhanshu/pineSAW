import re

with open('src/app/globals.css', 'r') as f:
    content = f.read()

# Make background pure black
content = content.replace('--background: #09090b;', '--background: #000000;')
content = content.replace('background: radial-gradient(circle at top right, rgba(24,24,27,1) 0%, rgba(9,9,11,1) 100%);', 'background: #000000;')

# Add glow utilities
glow_utils = """
@layer utilities {
  .glow-text {
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.7), 0 0 20px rgba(255, 255, 255, 0.5);
  }
  .glow-border {
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.1) inset, 0 0 15px rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  .glass-panel {
    background: rgba(10, 10, 10, 0.8);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}
"""

if '.glow-text' not in content:
    content += glow_utils

with open('src/app/globals.css', 'w') as f:
    f.write(content)
