#!/usr/bin/env bash
set -e

# Install Python dependencies for the backend
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt

# Start the FastAPI app
uvicorn backend.main:app --host 0.0.0.0 --port "${PORT:-8000}"
