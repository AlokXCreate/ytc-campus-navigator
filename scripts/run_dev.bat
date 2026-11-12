@echo off
echo ========================================================
echo   YTC CAMPUS NAVIGATOR - DEVELOPMENT LAUNCH SCRIPT
echo   Yashoda Technical Campus, Satara
echo   Department of Artificial Intelligence and Data Science
echo ========================================================
echo.

cd /d "%~dp0\.."

echo [1/2] Launching FastAPI Backend on http://localhost:8000 ...
start "YTC Navigator - FastAPI Backend" cmd /k "cd backend && .venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

timeout /t 2 /nobreak >nul

echo [2/2] Launching React Frontend on http://localhost:5173 ...
start "YTC Navigator - React Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo   Application started successfully!
echo   Frontend: http://localhost:5173
echo   Swagger API Docs: http://localhost:8000/docs
echo ========================================================
