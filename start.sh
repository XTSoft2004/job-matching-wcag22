#!/bin/bash
set -e

echo "=========================================================="
echo "    Preparing and Starting JobMatching Services on Ubuntu"
echo "=========================================================="
echo

# 1. Install Node.js dependencies using pnpm
echo "[+] Checking if pnpm is installed..."
if ! command -v pnpm &> /dev/null; then
    echo "[!] pnpm not found. Installing pnpm globally..."
    npm install -g pnpm
fi

echo "[+] Installing backend and frontend node dependencies..."
pnpm install

# 2. Build backend and frontend
echo "[+] Building backend NestJS app..."
pnpm build:backend

echo "[+] Building frontend Vite app..."
pnpm --prefix apps/frontend build

# 3. Setup Python Virtual Environment and dependencies for ai-tools
echo "[+] Setting up Python virtual environment for ai-tools..."
cd apps/ai-tools
if [ ! -d ".venv" ]; then
    echo "[+] Creating virtual environment (.venv)..."
    python3 -m venv .venv
fi

echo "[+] Upgrading pip and installing requirements..."
.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install -r requirements.txt

# Go back to root directory
cd ../..

# 4. Launch PM2
echo "[+] Starting all services using PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "[!] PM2 not found. Installing PM2 globally..."
    npm install -g pm2
fi

pm2 start ecosystem.config.js

echo
echo "=========================================================="
echo "    ALL SERVICES STARTED SUCCESSFULLY VIA PM2!"
echo "    - Frontend: http://localhost:5173"
echo "    - Backend: http://localhost:3000"
echo "    - AI Tools: http://localhost:8000"
echo
echo "    Use 'pm2 status' or 'pm2 logs' to manage the processes."
echo "=========================================================="
