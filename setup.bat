@echo off
echo ==========================================
echo       AIChatTool Setup Script
echo ==========================================

echo [1/4] Setting up Backend Python Environment...
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
) else (
    echo Virtual environment already exists.
)

echo Activating virtual environment...
call venv\Scripts\activate

echo [2/4] Installing Backend Dependencies...
pip install -r requirements.txt

cd ..

echo [3/4] Installing Frontend Dependencies...
cd frontend
call npm install

cd ..

echo [4/4] Setup Complete!
echo You can now run the application using start.bat
pause
