@echo off
echo.
echo ============================================================
echo   CAI DAT NEXT.JS AGENT SKILLS CHO DU AN
echo ============================================================
echo.

REM 1. Cai dat Next.js Best Practices (Essential)
echo [1/4] Dang cai dat Next.js Best Practices...
call npx skills add vercel-labs/next-skills --skill next-best-practices

REM 2. Cai dat Next.js 16 Cache Components (Cho phien ban Next 16)
echo [2/4] Dang cai dat Next.js 16 Cache Components...
call npx skills add vercel-labs/next-skills --skill next-cache-components

REM 3. Cai dat Next.js Upgrade Guides (Tu chon)
echo [3/4] Dang cai dat Next.js Upgrade Guides...
call npx skills add vercel-labs/next-skills --skill next-upgrade

REM 4. Cai dat React Best Practices (Essential)
echo [4/4] Dang cai dat React Best Practices...
call npx skills add vercel-labs/agent-skills --skill react-best-practices

call npx skills add Kadajett/agent-nestjs-skills

call npx skills add ant-design/ant-design-cli

echo.
echo [Bonus] Chu y: Du an nay co quy chuan rieng ve TypeScript DTO
echo        tai: .agents/workflows/typescript-dto.md
echo.
echo ============================================================
echo   CAI DAT HOAN TAT!
echo   VUI LONG KHOI DONG LAI PHIEN LAM VIEC CUA AI NEU CAN.
echo ============================================================
pause