#!/bin/bash

echo "Starting DARKINT Demo Verification..."

echo "1. Checking Backend API (port 8000)"
curl -s http://localhost:8000/api/system/health | grep '"status":"healthy"' > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend API healthy"
else
    echo "❌ Backend API unhealthy or offline"
    exit 1
fi

echo "2. Checking Frontend UI (port 3000)"
curl -s http://localhost:3000 > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Frontend UI reachable"
else
    echo "❌ Frontend UI unreachable"
    exit 1
fi

echo "3. Checking FAISS Index generation..."
if [ -f "../artifacts/indexes/faiss_index.bin" ]; then
    echo "✅ Vector index found"
else
    echo "❌ Vector index missing. Run ingestion first."
fi

echo "🎉 Demo verification complete."
