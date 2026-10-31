#!/usr/bin/env bash
# ==============================================================================
# AICTE APAAR Student Ledger — SIH 26263 Live Demo Launcher
# Starts both the FastAPI Backend (Port 8000) and React Vite Frontend (Port 5173)
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
BACKEND_DIR="$DIR/SIH-backend"
FRONTEND_DIR="$DIR/Agastya_Sih"

echo "==================================================================="
echo "  AICTE APAAR National Student Ledger (SIH26263) — Demo Launcher"
echo "==================================================================="

# 1. Check Python virtual environment
if [ ! -d "$BACKEND_DIR/.venv" ]; then
    echo "[!] Virtual environment not found. Creating .venv..."
    python3 -m venv "$BACKEND_DIR/.venv"
    "$BACKEND_DIR/.venv/bin/pip" install -r "$BACKEND_DIR/requirements.txt"
fi

# 2. Start Backend
echo "[+] Starting FastAPI Backend on http://localhost:8000..."
cd "$BACKEND_DIR"
"$BACKEND_DIR/.venv/bin/uvicorn" app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Trap signals to cleanly kill both processes on Ctrl+C
cleanup() {
    echo ""
    echo "[*] Shutting down services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Give backend a moment to initialize database
sleep 2

# 3. Start Frontend
echo "[+] Starting React Frontend on http://localhost:5173..."
cd "$FRONTEND_DIR"
npm run dev -- --host &
FRONTEND_PID=$!

echo ""
echo "==================================================================="
echo "  🚀 SYSTEM IS LIVE & READY FOR JURY EVALUATION!"
echo "  ---------------------------------------------------------------"
echo "  Frontend App:  http://localhost:5173"
echo "  Backend API:   http://localhost:8000/docs (Swagger UI)"
echo "  Demo Accounts: Sign-in with 1-click Jury Persona Switcher"
echo "==================================================================="
echo "Press Ctrl+C to stop both servers."

wait
