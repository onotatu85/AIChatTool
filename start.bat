@echo off
echo ==========================================
echo       Starting AIChatTool
echo ==========================================

echo Starting Backend Server...
start "AIChatTool Backend" cmd /k "cd backend && call venv\Scripts\activate && cd .. && python -m backend.app"

echo Starting Frontend Dev Server...
start "AIChatTool Frontend" cmd /k "cd frontend && npm run dev"

echo Waiting for servers to start...
timeout /t 5

echo Opening Browser...
start http://localhost:5173

echo ==========================================
echo Application is running!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo Close the command windows to stop the app.
echo ==========================================
pause
