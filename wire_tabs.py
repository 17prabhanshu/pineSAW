import re

with open('src/app/entities/[id]/page.tsx', 'r') as f:
    content = f.read()

# Add imports
imports = """
import FinancialTab from "@/components/tabs/FinancialTab";
import EvidenceTab from "@/components/tabs/EvidenceTab";
import AlertsTab from "@/components/tabs/AlertsTab";
import InvestigationsTab from "@/components/tabs/InvestigationsTab";
import LegalTab from "@/components/tabs/LegalTab";
import ActionsTab from "@/components/tabs/ActionsTab";
"""
content = content.replace('import { EntityFlowchart }', imports + 'import { EntityFlowchart }')

# Replace the fallback block with the new tabs
fallback_regex = r'\{\!\[.*?\]\.includes\(activeTab\) && \(\s*<div.*?<Folder size=\{48\}.*?No records available for \{activeTab\}.*?<\/div>\s*\)\}'

new_tabs = """
        {activeTab === "FINANCIAL" && <FinancialTab entity={entity} />}
        {activeTab === "EVIDENCE" && <EvidenceTab entity={entity} />}
        {activeTab === "ALERTS" && <AlertsTab entity={entity} />}
        {activeTab === "INVESTIGATIONS" && <InvestigationsTab entity={entity} />}
        {activeTab === "LEGAL" && <LegalTab entity={entity} />}
        {activeTab === "ACTIONS" && <ActionsTab entity={entity} />}
"""

content = re.sub(fallback_regex, new_tabs, content, flags=re.DOTALL)

with open('src/app/entities/[id]/page.tsx', 'w') as f:
    f.write(content)
