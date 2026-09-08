import uuid
import datetime
from fastapi import APIRouter, Body

legal_router = APIRouter()

@legal_router.post("/legal/draft_request")
def draft_bank_request(entity_id: str = Body(...), label: str = Body(...)):
    # Simulate an actual backend document generation process
    # In a real app this would use a docx templating engine
    
    req_id = f"REQ-BANK-{uuid.uuid4().hex[:6].upper()}"
    date_str = datetime.datetime.now().strftime("%d-%b-%Y")
    
    draft = f"""CONFIDENTIAL / LAW ENFORCEMENT ONLY
Date: {date_str}
Ref: {req_id}

To: Nodal Officer, Financial Intelligence Unit (FIU-IND)
Sub: Requisition for KYC and Transaction Records under Section 91 Cr.P.C.

Please provide complete Account Opening Forms (AOF), KYC documents, and itemized ledger statements from 01-Jan-2025 to date for any accounts associated with the entity known as '{label}' (System ID: {entity_id}).

This information is required in connection with an ongoing investigation into illicit darknet marketplace narcotics distribution networks.

Authorized by:
Cyber Crime Cell, Chandigarh Police
"""
    
    return {
        "status": "success",
        "request_id": req_id,
        "document_type": "Cr.P.C. 91 Requisition",
        "draft_content": draft
    }
