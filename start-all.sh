#!/bin/bash

set -m

echo "Starting MediLink AI..."

# Helper to run a command and continue on error
safe_run() {
  local desc="$1"; shift
  echo "-> $desc"
  "$@" || echo "[warn] Failed: $desc (continuing)"
}

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 1) Start Ollama in background
safe_run "Starting Ollama" bash -lc "ollama serve > /dev/null 2>&1 &"
sleep 2

# 2) Start Langflow (logs to project root)
safe_run "Starting Langflow on :7860" bash -lc "nohup langflow run --host 0.0.0.0 --port 7860 > \"$ROOT_DIR/langflow.log\" 2>&1 &"
sleep 5

# 3) Start N8N (docker)
if command -v docker > /dev/null 2>&1; then
  if docker ps -a --format '{{.Names}}' | grep -q '^n8n$'; then
    safe_run "Starting existing n8n container" docker start n8n > /dev/null 2>&1
  else
    safe_run "Running new n8n container" docker run -d --name n8n -p 5678:5678 n8nio/n8n > /dev/null 2>&1
  fi
else
  echo "[warn] Docker not found. Skipping N8N startup."
fi
sleep 3

# 4) Start Backend (uvicorn)
if [ -d "$ROOT_DIR/backend" ]; then
  pushd "$ROOT_DIR/backend" > /dev/null 2>&1
  if [ -d ".venv" ]; then
    # shellcheck disable=SC1091
    source .venv/bin/activate > /dev/null 2>&1 || true
  fi
  safe_run "Starting Backend (Uvicorn on :8000)" bash -lc "nohup uvicorn main:app --reload > \"$ROOT_DIR/backend/backend.log\" 2>&1 &"
  popd > /dev/null 2>&1
else
  echo "[warn] Backend directory not found. Skipping backend."
fi
sleep 3

# 5) Start Frontend (Vite dev server)
if [ -d "$ROOT_DIR/frontend" ]; then
  pushd "$ROOT_DIR/frontend" > /dev/null 2>&1
  safe_run "Starting Frontend (Vite on :5173)" bash -lc "nohup npm run dev > \"$ROOT_DIR/frontend/frontend.log\" 2>&1 &"
  popd > /dev/null 2>&1
else
  echo "[warn] Frontend directory not found. Skipping frontend."
fi
sleep 3

echo "All services attempted to start."
echo ""
echo "URLs:"
echo "- Frontend:  http://localhost:5173"
echo "- Backend:   http://localhost:8000"
echo "- Langflow:  http://localhost:7860"
echo "- N8N:       http://localhost:5678"
echo ""
echo "Press Ctrl+C to stop"

# Wait indefinitely
wait


