@echo off
title Start All Services - JobMatching
echo ==========================================================
echo       PREPARING AND STARTING JOBMATCHING SERVICES (DEV)
echo ==========================================================
echo.

:: 1. Check Node.js and NPM
echo [+] Checking Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [-] Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

:: 2. Install pnpm
echo [+] Checking if pnpm is installed...
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] pnpm not found. Installing pnpm globally...
    npm install -g pnpm
)

:: 3. Install NPM packages
echo [+] Installing node dependencies in monorepo...
call pnpm install

:: 4. Check Python
echo [+] Checking Python...
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [-] Python is not installed. Please install Python 3.10+ first.
    pause
    exit /b 1
)

:: 5. Create Python Virtual Env and install requirements
echo [+] Setting up Python virtual environment for ai-tools...
cd apps\ai-tools
if not exist .venv (
    echo [+] Creating virtual environment .venv...
    python -m venv .venv
)
echo [+] Installing requirements...
call .venv\Scripts\python.exe -m pip install --upgrade pip
call .venv\Scripts\python.exe -m pip install -r requirements.txt
cd ..\..

echo.
echo [+] Starting AI Tools (FastAPI) on port 8000...
start "AI Tools" cmd /k "pnpm dev:ai"

echo [+] Starting Backend (NestJS) on port 3000...
start "Backend" cmd /k "pnpm dev:backend"

echo [+] Starting Frontend (Vite) on port 5173...
start "Frontend" cmd /k "pnpm dev:frontend"

echo.
echo ==========================================================
echo  ALL SERVICES STARTED IN SEPARATE CMD WINDOWS!
echo ==========================================================
echo.
pause
