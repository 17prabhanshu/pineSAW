from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.stream import stream_router

app = FastAPI(title="PineSAW Mock API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stream_router, prefix="/api")

@app.post("/api/parse_text")
def mock_parse_text(req: dict):
    # Dummy mock response since NLP is compiling
    from app.services.financial.chain_tracker import extract_and_trace_wallets
    chain_traces = extract_and_trace_wallets(req.get("text", ""))
    return {
        "classification": {"is_suspicious": True, "anomaly_score": 0.99, "matches": ["mock"]},
        "entities": [{"type": "MOCK_ENTITY", "value": "Awaiting PyTorch Engine", "confidence": 1.0}],
        "chain_traces": chain_traces
    }
