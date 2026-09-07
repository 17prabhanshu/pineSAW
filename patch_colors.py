import re

with open('src/app/globals.css', 'r') as f:
    content = f.read()

# Replace all cyan/blue/amber with white/zinc in css variables for a true monochrome look
content = content.replace('--color-nexus-cyan: #22d3ee;', '--color-nexus-cyan: #ffffff;')
content = content.replace('--color-nexus-amber: #fbbf24;', '--color-nexus-amber: #e4e4e7;')
content = content.replace('--color-gov-blue: #3b82f6;', '--color-gov-blue: #ffffff;')
content = content.replace('--color-gov-blue-hover: #2563eb;', '--color-gov-blue-hover: #e4e4e7;')
content = content.replace('--color-gov-blue-light: #1e3a8a;', '--color-gov-blue-light: #27272a;')

with open('src/app/globals.css', 'w') as f:
    f.write(content)
