@echo off
echo ========================================================
echo   YTC CAMPUS NAVIGATOR - DATABASE SEED SCRIPT
echo ========================================================
cd /d "%~dp0\..\backend"
call .venv\Scripts\activate
python -m app.database.seed_data
echo.
pause
