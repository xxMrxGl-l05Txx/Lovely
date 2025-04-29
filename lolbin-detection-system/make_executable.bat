@echo off
echo Making shell script executable for Linux/macOS users...
echo This only needs to be run once on Windows to prepare the file for Linux/macOS users.

:: Add execute permission marker to the file
powershell -Command "(Get-Content start_all_services.sh) | Set-Content -Encoding UTF8 start_all_services.sh"

echo Done! When using this on Linux/macOS, run "chmod +x start_all_services.sh" before execution.