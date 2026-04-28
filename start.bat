@echo off
echo.
echo 🛡️  CrisisNexus — Rapid Crisis Response Platform
echo ==================================================
echo.

cd /d "%~dp0backend"

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

echo Installing dependencies...
call npm install --silent

echo.
echo Starting CrisisNexus server...
echo.
echo    Dashboard : http://localhost:5000
echo    Health    : http://localhost:5000/api/health
echo.
echo    Press Ctrl+C to stop
echo.

node server.js
pause
