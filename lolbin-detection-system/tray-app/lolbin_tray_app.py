#!/usr/bin/env python3
import json
import os
import sys
import time
import threading
import webbrowser
from datetime import datetime
import requests
import tkinter as tk
from tkinter import messagebox
import pystray
from PIL import Image, ImageDraw

# Configuration
BACKEND_URL = "http://localhost:3000/api"
DASHBOARD_URL = "http://localhost:8080"
CHECK_INTERVAL = 10  # seconds between alert checks
APP_NAME = "LOLBin Monitor"
ICON_SIZE = 64

# Track seen alerts to avoid duplicates
seen_alerts = set()
last_check_time = datetime.now()

# Create a basic square icon
def create_icon():
    # Create a solid red square icon
    width = height = ICON_SIZE
    color1 = (200, 0, 0)  # Red for the shield color
    color2 = (255, 255, 255)  # White for the details
    
    image = Image.new('RGB', (width, height), color=(0, 0, 0, 0))
    dc = ImageDraw.Draw(image)
    
    # Draw a shield shape
    dc.polygon([(width//2, 5), (width-5, 20), (width-10, height-10), 
                (width//2, height-5), (10, height-10), (5, 20)], 
                fill=color1)
    
    # Draw an exclamation mark
    dc.rectangle([(width//2-5, height//4), (width//2+5, height//2+10)], fill=color2)
    dc.ellipse([(width//2-5, height//2+15), (width//2+5, height//2+25)], fill=color2)
    
    return image

# Create a notification window using tkinter
def show_notification(title, message, alert_id=None):
    notification_window = tk.Tk()
    notification_window.withdraw()  # Hide the main window
    
    # Create a new top-level window for the notification
    popup = tk.Toplevel()
    popup.title(title)
    popup.attributes("-topmost", True)  # Keep on top
    
    # Position in bottom right corner
    screen_width = popup.winfo_screenwidth()
    screen_height = popup.winfo_screenheight()
    popup.geometry(f"400x200+{screen_width-420}+{screen_height-250}")
    
    # Add some padding
    frame = tk.Frame(popup, padx=20, pady=20)
    frame.pack(fill=tk.BOTH, expand=True)
    
    # Notification content
    tk.Label(frame, text=title, font=("Arial", 14, "bold")).pack(anchor="w")
    tk.Label(frame, text=message, wraplength=360, justify="left").pack(anchor="w", pady=(10, 20))
    
    # Buttons
    button_frame = tk.Frame(frame)
    button_frame.pack(fill=tk.X)
    
    # Dismiss button
    dismiss_button = tk.Button(button_frame, text="Dismiss", command=popup.destroy)
    dismiss_button.pack(side="right", padx=5)
    
    # View Details button
    if alert_id:
        view_button = tk.Button(button_frame, text="View Details", 
                              command=lambda: open_dashboard_alert(alert_id, popup))
        view_button.pack(side="right", padx=5)
    
    # Auto-close after 15 seconds
    popup.after(15000, popup.destroy)
    
    # Destroy hidden main window when notification is closed
    popup.protocol("WM_DELETE_WINDOW", lambda: [popup.destroy(), notification_window.destroy()])
    
    # Start tkinter main loop
    notification_window.mainloop()

def open_dashboard_alert(alert_id, window=None):
    """Open the dashboard to a specific alert"""
    url = f"{DASHBOARD_URL}/alert/{alert_id}"
    webbrowser.open(url)
    if window:
        window.destroy()

def check_for_alerts():
    """Check for new alerts from the backend"""
    global last_check_time
    
    try:
        response = requests.get(f"{BACKEND_URL}/events/suspicious", timeout=5)
        if response.status_code == 200:
            alerts = response.json()
            
            # Process any new alerts
            for alert in alerts:
                # Create a unique ID for the alert
                alert_id = f"alert-{alert['process_id']}-{alert.get('timestamp', '')}"
                
                # Check if this is a new alert we haven't seen yet
                if alert_id not in seen_alerts:
                    seen_alerts.add(alert_id)
                    
                    # Extract alert details
                    timestamp = alert.get('timestamp', '')
                    process = alert.get('executable_path', '').split('\\')[-1]
                    reason = alert.get('reason', f"Suspicious {process} execution detected")
                    command = alert.get('command_line', '')
                    
                    # Show notification in a separate thread to not block
                    notification_thread = threading.Thread(
                        target=show_notification,
                        args=(
                            f"LOLBin Alert: {process}",
                            f"{reason}\n\nCommand: {command[:50]}{'...' if len(command) > 50 else ''}",
                            alert_id
                        )
                    )
                    notification_thread.daemon = True
                    notification_thread.start()
            
            # Update last check time
            last_check_time = datetime.now()
            
    except Exception as e:
        print(f"Error checking for alerts: {e}")
    
    return True  # Continue checking

def create_menu(icon):
    """Create the system tray icon menu"""
    return pystray.Menu(
        pystray.MenuItem("Open Dashboard", lambda: webbrowser.open(DASHBOARD_URL)),
        pystray.MenuItem("Check for Alerts Now", lambda: check_for_alerts()),
        pystray.MenuItem("About", lambda: show_notification(
            "About LOLBin Monitor", 
            "LOLBin Monitor Tray App\nVersion 1.0\n\nMonitoring for suspicious activity.")),
        pystray.MenuItem("Exit", lambda: icon.stop())
    )

def setup_tray():
    """Set up the system tray icon and start monitoring"""
    icon = pystray.Icon("lolbin_monitor", create_icon(), "LOLBin Monitor", create_menu(None))
    
    # Update the icon's menu with itself as a parameter
    icon.menu = create_menu(icon)
    
    # Start periodic alert checking in a separate thread
    def alert_check_thread():
        while True:
            check_for_alerts()
            time.sleep(CHECK_INTERVAL)
    
    thread = threading.Thread(target=alert_check_thread)
    thread.daemon = True
    thread.start()
    
    # Run the tray icon
    icon.run()

if __name__ == "__main__":
    # Show startup notification
    notification_thread = threading.Thread(
        target=show_notification,
        args=(
            "LOLBin Monitor Active",
            "The LOLBin detection system is now running in the background. "
            "You will be notified of any suspicious activity."
        )
    )
    notification_thread.daemon = True
    notification_thread.start()
    
    # Start the system tray app
    setup_tray()