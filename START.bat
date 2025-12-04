@echo off
echo ========================================
echo   Starting SRMS Application
echo ========================================
echo.

REM Check if MongoDB is running
echo Checking MongoDB...
sc query MongoDB >nul 2>&1
if errorlevel 1 (
    echo MongoDB service not found. Starting MongoDB...
    net start MongoDB
    if errorlevel 1 (
        echo ERROR: Could not start MongoDB
        echo Please install MongoDB or start it manually
        pause
        exit /b 1
    )
) else (
    echo MongoDB is running
)

echo.
echo Navigating to backend folder...
cd /d "%~dp0backend"
if errorlevel 1 (
    echo ERROR: Backend folder not found
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo Dependencies already installed
)

REM Check if .env exists
if not exist .env (
    echo Creating .env file...
    (
        echo PORT=3000
        echo MONGODB_URI=mongodb://localhost:27017/srms
        echo JWT_SECRET=your-secret-key-change-this-in-production
        echo NODE_ENV=development
    ) > .env
    echo .env file created
) else (
    echo .env file exists
)

echo.
echo ========================================
echo   Starting server...
echo   Keep this window open!
echo ========================================
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
call npm start

pause








