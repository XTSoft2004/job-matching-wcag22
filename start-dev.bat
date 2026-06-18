@echo off
title Start All Services - JobMatching

echo ==========================================================
echo       STARTING JOBMATCHING SERVICES
echo ==========================================================
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
