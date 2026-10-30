#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

PYTHON_BIN="${PYTHON_BIN:-python3}"
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-8000}"

if [[ -f ".venv/bin/activate" ]]; then
    # shellcheck disable=SC1091
    source ".venv/bin/activate"
elif [[ -f "venv/bin/activate" ]]; then
    # shellcheck disable=SC1091
    source "venv/bin/activate"
else
    echo "Creating Python virtual environment in .venv..."
    "$PYTHON_BIN" -m venv .venv
    # shellcheck disable=SC1091
    source ".venv/bin/activate"
fi

echo "Installing backend requirements..."
python -m pip install -r backend/requirements.txt

echo "Starting FastAPI at http://${HOST}:${PORT}"
exec python -m uvicorn backend.app.main:app \
    --reload \
    --host "$HOST" \
    --port "$PORT"
