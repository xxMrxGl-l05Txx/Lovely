#!/bin/bash

echo "==================================="
echo "LOLBin Detection System Launcher"
echo "==================================="
echo

echo "Starting all LOLBin monitoring services..."
echo

# Start the backend server
echo "Starting backend server..."
cd backend-bridge && npm start &
BACKEND_PID=$!
echo "Backend server starting with PID: $BACKEND_PID"
echo

# Wait a moment for backend to initialize
echo "Waiting for services to initialize..."
sleep 5

# Start the frontend dashboard
echo "Starting frontend dashboard..."
cd ..
npm run dev &
FRONTEND_PID=$!
echo "Frontend dashboard starting with PID: $FRONTEND_PID"
echo

# Wait a moment for frontend to initialize
sleep 2

# Start the tray application
echo "Starting notification tray app..."
cd tray-app
python lolbin_tray_app.py &
TRAY_PID=$!
echo "Tray application starting with PID: $TRAY_PID"
echo

echo "All services started successfully!"
echo
echo "- Backend server: http://localhost:3000"
echo "- Frontend dashboard: http://localhost:8080"
echo "- Tray application: Running in system tray"
echo
echo "To stop all services, press Ctrl+C or close this terminal window"
echo "==================================="

# Keep script running to allow easy termination of all processes
trap "kill $BACKEND_PID $FRONTEND_PID $TRAY_PID; exit" INT TERM
wait