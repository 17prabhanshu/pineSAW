from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import init_db
from app.api import routes
from app.core.auth import verify_api_key
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.services.embeddings.hybrid_search import hybrid_retriever
import os
import sys

# Item 2: Fail fast if API key is not set
if not os.environ.get("DARKINT_API_KEY"):
    print("CRITICAL ERROR: DARKINT_API_KEY environment variable is not set. Exiting.")
    sys.exit(1)

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="DARKINT API", description="Intelligence Platform for Detection of Illicit Drug Sales")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 2.3 Explicit CORS allow-list
FRONTEND_URL = os.getenv("NEXT_PUBLIC_FRONTEND_URL", "http://localhost:3001")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()
    # 3.1 Load FAISS index if exists
    try:
        hybrid_retriever.load_index("data/index.faiss")
    except Exception as e:
        print(f"Could not load FAISS index: {e}. Starting fresh.")

@app.on_event("shutdown")
def on_shutdown():
    # 3.1 Persist FAISS index
    import os
    os.makedirs("data", exist_ok=True)
    hybrid_retriever.save()

# 2.1 Protect all routes except health with API Key
app.include_router(routes.router, prefix="/api", dependencies=[Depends(verify_api_key)])

@app.get("/api/system/health")
def health_check():
    return {
        "status": "healthy",
        "components": {
            "database": "ok",
            "api": "ok"
        }
    }
