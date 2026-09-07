import re

with open('src/app/layout.tsx', 'r') as f:
    content = f.read()

# Make sure Lenis is imported
if 'import { ReactLenis } from "@studio-freight/react-lenis";' not in content:
    content = content.replace('export default function RootLayout', 'import { ReactLenis } from "@studio-freight/react-lenis";\n\nexport default function RootLayout')

# Inject ClientLenis wrapper inside body
if '<ReactLenis' not in content:
    body_start = content.find('<body')
    body_close = content.find('>', body_start) + 1
    
    # We want to wrap the children.
    # It might be easier to just create a ClientWrapper component or directly wrap it.
    
    # Actually, it's a server component. ReactLenis requires 'use client'.
    pass

with open('src/app/layout.tsx', 'w') as f:
    f.write(content)
