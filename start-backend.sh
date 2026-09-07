#!/bin/bash
cd backend
if [ ! -d "venv" ]; then
  python3 -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
else
  source venv/bin/activate
fi
export DARKINT_API_KEY=testkey123
uvicorn app.main:app --reload --port 8000
