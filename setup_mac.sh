#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
VENV_DIR="$BACKEND_DIR/.venv"

command -v python3 >/dev/null 2>&1 || { echo "python3 is required."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "node is required (install from https://nodejs.org or use brew install node)."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required."; exit 1; }

echo "[1/4] Creating backend virtual environment..."
python3 -m venv "$VENV_DIR"

# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"

echo "[2/4] Installing backend Python dependencies..."
pip install --upgrade pip
pip install -r "$BACKEND_DIR/requirements.txt"

echo "[3/4] Running backend migrations..."
python "$BACKEND_DIR/manage.py" migrate

echo "[4/4] Installing frontend npm dependencies..."
cd "$FRONTEND_DIR"
npm install

cat <<MSG

Setup complete.

To run backend:
  cd backend
  source .venv/bin/activate
  python manage.py runserver

To run frontend (new terminal):
  cd frontend
  npm run dev

Frontend URL: http://localhost:5173
Backend URL:  http://127.0.0.1:8000
MSG
