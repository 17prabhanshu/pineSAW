import re

with open('src/app/layout.tsx', 'r') as f:
    content = f.read()

if 'SmoothScroll' not in content:
    content = content.replace('export default function RootLayout', 'import { SmoothScroll } from "@/components/SmoothScroll";\nexport default function RootLayout')
    content = content.replace('{children}', '<SmoothScroll>{children}</SmoothScroll>')

with open('src/app/layout.tsx', 'w') as f:
    f.write(content)
