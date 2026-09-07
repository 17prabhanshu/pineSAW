import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Regex to match the ML Engine Status Widget block
widget_regex = r'\{\/\* ML Engine Status Widget \*\/\}\s*<div className="mb-6 flex gap-4 overflow-x-auto pb-2">.*?(?=\{\/\* Breadcrumb \*\/\})'

content = re.sub(widget_regex, '', content, flags=re.DOTALL)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)
