@echo off
REM This script requires administrator privileges
REM Right-click and select "Run as administrator"

echo ========================================
echo   Starting SRMS Application
echo   (Requires Administrator Rights)
echo ========================================
echo.

REM Check if running as admin
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo.
    echo Right-click this file and select "Run as administrator"
    pause
    exit /b 1
)

REM Check if MongoDB is running
echo Checking MongoDB service...
sc query MongoDB >nul 2>&1
if errorlevel 1 (
    echo MongoDB service not found. Starting MongoDB...
    net start MongoDB
    if errorlevel 1 (
        echo ERROR: Could not start MongoDB
        echo MongoDB might not be installed
        echo.
        echo Option: Use MongoDB Atlas (cloud) instead
        echo Visit: https://www.mongodb.com/cloud/atlas
        pause
        exit /b 1
    )
    echo MongoDB started successfully!
) else (
    echo MongoDB is already running
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








