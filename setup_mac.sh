#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

command -v node >/dev/null 2>&1 || { echo "node is required (install from https://nodejs.org or use brew install node)."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required."; exit 1; }


echo "[1/3] Installing backend dependencies..."
cd "$BACKEND_DIR"
npm install

echo "[2/3] Installing frontend dependencies..."
cd "$FRONTEND_DIR"
npm install

echo "[3/3] Setup complete."

cat <<MSG

To run backend:
  cd backend
  cp .env.example .env
  # add your GEMINI_API_KEY in .env
  npm run dev

To run frontend (new terminal):
  cd frontend
  npm run dev

Frontend URL: http://localhost:5173
Backend URL:  http://127.0.0.1:8787
MSG
