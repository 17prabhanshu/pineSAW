#!/bin/bash

# golden_run.sh
# Wipes database, generates data, trains models, runs inference and tests the end-to-end pipeline

echo "==================================="
echo " DARKINT GOLDEN VERIFICATION RUN"
echo "==================================="

# Navigate to backend
cd "$(dirname "$0")/../"

echo "[1/8] Cleaning up existing artifacts and DB..."
rm -f darkint.db
rm -rf artifacts/models/*
rm -rf artifacts/indexes/*
rm -rf artifacts/evaluation/*

echo "[2/8] Generating Golden Dataset..."
./venv/bin/python scripts/generate_demo_data.py

echo "[2.5/8] Running strict data leakage audit..."
./venv/bin/python scripts/audit_leakage.py

echo "[3/8] Training ML Baselines and Extracting Validation Metrics..."
./venv/bin/python scripts/train_model.py
cat artifacts/evaluation/metrics.json

echo "[4/8] Restarting FastAPI server..."
# Kill any existing server
kill -9 $(lsof -t -i:8000) 2>/dev/null || true
sleep 2

./venv/bin/uvicorn app.main:app --reload --port 8000 &
SERVER_PID=$!

echo "Waiting for server to start (25s for ML models to load)..."
sleep 25

echo "[5/8] Verifying API Health..."
curl -s http://localhost:8000/api/system/health | grep '"status":"healthy"' > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend API healthy"
else
    echo "❌ Backend API unhealthy or offline"
    kill $SERVER_PID
    exit 1
fi

echo "[5.5/8] Running Fusion Benchmarks..."
./venv/bin/python scripts/benchmark_fusion.py
if [ $? -ne 0 ]; then
    echo "❌ Fusion Benchmarks Failed!"
    kill $SERVER_PID
    exit 1
fi
echo "✅ Fusion Benchmarks Passed!"

echo "[6/8] Replaying Dataset (Ingestion Pipeline -> ML Classifier -> FAISS -> Graph -> Alerts)..."
./venv/bin/python scripts/run_replay.py

echo "[7/8] Running Graph Analytics (NetworkX Centrality)..."
CENTRALITY=$(curl -s http://localhost:8000/api/analytics/graph/centrality)
echo "NetworkX output sampled: ${CENTRALITY:0:100}..."

echo "[8/8] Testing Analyst Copilot..."
COPILOT_RESP=$(curl -s -X POST http://localhost:8000/api/copilot/query -H "Content-Type: application/json" -d '{"query":"Why is vendor_23 high risk?"}')
echo "Copilot response sampled: ${COPILOT_RESP:0:150}..."

echo "==================================="
echo "✅ Golden Verification Complete"
echo "==================================="

kill $SERVER_PID
