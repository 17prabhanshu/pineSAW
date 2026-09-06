import re

with open('src/app/globals.css', 'r') as f:
    content = f.read()

new_glass = """
.glass {
  background: rgba(10, 10, 12, 0.6);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.02), 0 8px 32px rgba(0, 0, 0, 0.5);
}
"""

content = re.sub(r'\.glass \{[^}]+\}', new_glass.strip(), content)

with open('src/app/globals.css', 'w') as f:
    f.write(content)
