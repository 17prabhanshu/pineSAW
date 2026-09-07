from fastapi import Security, HTTPException, status
from fastapi.security import APIKeyHeader

import os

# Note: For hackathon deployment, an API-key header is acceptable as a minimum.
# TODO: This should be upgraded to full JWT + role-based access before any real deployment.
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

def get_valid_api_key():
    return os.environ.get("DARKINT_API_KEY")

async def verify_api_key(api_key: str = Security(api_key_header)):
    if not api_key or api_key != get_valid_api_key():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    return api_key
