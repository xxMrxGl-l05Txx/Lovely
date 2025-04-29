@echo off
echo ===================================
echo LOLBin Detection System Launcher
echo ===================================
echo.

echo Starting all LOLBin monitoring services...
echo.

:: Start the backend server in a new window
echo Starting backend server...
start "LOLBin Backend" cmd /k "cd backend-bridge && npm start"
echo Backend server starting...
echo.

:: Wait a moment for backend to initialize
timeout /t 5 /nobreak > nul

:: Start the frontend dashboard in a new window
echo Starting frontend dashboard...
start "LOLBin Dashboard" cmd /k "npm run dev"
echo Frontend dashboard starting...
echo.

:: Wait a moment for frontend to initialize
timeout /t 2 /nobreak > nul

:: Start the tray application
echo Starting notification tray app...
start "LOLBin Tray App" cmd /k "cd tray-app && start_tray_app.bat"
echo Tray application starting...
echo.

echo All services started successfully!
echo.
echo - Backend server: http://localhost:3000
echo - Frontend dashboard: http://localhost:8080
echo - Tray application: Running in system tray
echo.
echo You can now close this window if desired.
echo ===================================