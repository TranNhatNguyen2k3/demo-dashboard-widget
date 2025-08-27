@echo off
echo Starting ThingsBoard Widget Backend...
echo.

REM Check if Go is installed
go version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Go is not installed or not in PATH
    echo Please install Go from https://golang.org/
    pause
    exit /b 1
)

echo Go version:
go version
echo.

REM Install dependencies
echo Installing dependencies...
go mod tidy
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Starting server on http://localhost:8080
echo Press Ctrl+C to stop
echo.

REM Run the backend
go run main.go

pause
