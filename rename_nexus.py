import os
import re

files_to_update = [
    "src/app/layout.tsx",
    "src/components/Sidebar.tsx",
    "src/app/not-found.tsx",
    "src/app/reports/page.tsx",
    "src/app/reports/layout.tsx",
    "src/app/entities/layout.tsx",
    "src/app/investigations/layout.tsx",
    "src/app/alerts/layout.tsx",
    "src/app/ingestion/layout.tsx",
    "src/app/search/layout.tsx",
    "package.json",
    "generate_doc.py",
    "PITCH_GUIDE.md"
]

for rel_path in files_to_update:
    abs_path = os.path.join("/Users/prabhanshushekhar/Desktop/CP3", rel_path)
    if os.path.exists(abs_path):
        with open(abs_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Replace NEXUS / Nexus with pineSAW
        new_content = content.replace("NEXUS", "pineSAW").replace("Nexus", "pineSAW")
        
        with open(abs_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated {rel_path}")

