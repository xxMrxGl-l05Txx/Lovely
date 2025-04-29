// install_service.go
// Utility to install/uninstall the LOLBin Monitor as a Windows service

package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"

	"golang.org/x/sys/windows/svc/eventlog"
	"golang.org/x/sys/windows/svc/mgr"
)

func main() {
	// Parse command line flags
	installPtr := flag.Bool("install", false, "Install the service")
	uninstallPtr := flag.Bool("uninstall", false, "Uninstall the service")
	flag.Parse()

	svcName := "WinLOLBinMonitor"
	svcDesc := "Windows LOLBin Process Monitor"

	// Determine which action to take
	if *installPtr {
		if err := installService(svcName, svcDesc); err != nil {
			fmt.Printf("Failed to install service: %v\n", err)
			os.Exit(1)
		}
		fmt.Println("Service installed successfully")
	} else if *uninstallPtr {
		if err := uninstallService(svcName); err != nil {
			fmt.Printf("Failed to uninstall service: %v\n", err)
			os.Exit(1)
		}
		fmt.Println("Service uninstalled successfully")
	} else {
		fmt.Println("Usage: install_service [-install] [-uninstall]")
		flag.PrintDefaults()
	}
}

// installService installs the application as a Windows service
func installService(name, desc string) error {
	// Get the absolute path of the executable
	exePath, err := os.Executable()
	if err != nil {
		return fmt.Errorf("failed to get executable path: %v", err)
	}

	// Get the path for the main service executable
	mainExe := filepath.Join(filepath.Dir(exePath), "windows-lolbin-monitor.exe")

	// Verify the service executable exists
	if _, err := os.Stat(mainExe); os.IsNotExist(err) {
		return fmt.Errorf("service executable not found at %s", mainExe)
	}

	// Connect to the Windows service manager
	m, err := mgr.Connect()
	if err != nil {
		return fmt.Errorf("failed to connect to service manager: %v", err)
	}
	defer m.Disconnect()

	// Check if service already exists
	s, err := m.OpenService(name)
	if err == nil {
		s.Close()
		return fmt.Errorf("service %s already exists", name)
	}

	// Create the service
	s, err = m.CreateService(name, mainExe, mgr.Config{
		DisplayName: name,
		Description: desc,
		StartType:   mgr.StartAutomatic,
	})
	if err != nil {
		return fmt.Errorf("failed to create service: %v", err)
	}
	defer s.Close()

	// Set up the event log
	if err = eventlog.InstallAsEventCreate(name, eventlog.Error|eventlog.Warning|eventlog.Info); err != nil {
		s.Delete()
		return fmt.Errorf("failed to setup event log: %v", err)
	}

	fmt.Println("Service has been installed. Starting service...")
	
	// Start the service
	if err = s.Start(); err != nil {
		return fmt.Errorf("failed to start service: %v", err)
	}

	return nil
}

// uninstallService removes the Windows service
func uninstallService(name string) error {
	// Connect to the Windows service manager
	m, err := mgr.Connect()
	if err != nil {
		return fmt.Errorf("failed to connect to service manager: %v", err)
	}
	defer m.Disconnect()

	// Open the service
	s, err := m.OpenService(name)
	if err != nil {
		return fmt.Errorf("service %s is not installed", name)
	}
	defer s.Close()

	// Stop the service if it's running
	status, err := s.Query()
	if err != nil {
		return fmt.Errorf("failed to query service status: %v", err)
	}

	if status.State != mgr.Stopped {
		fmt.Println("Stopping service...")
		if _, err := s.Control(mgr.Stop); err != nil {
			return fmt.Errorf("failed to stop service: %v", err)
		}
		
		// Wait for the service to stop
		for status.State != mgr.Stopped {
			time.Sleep(time.Second)
			status, err = s.Query()
			if err != nil {
				return fmt.Errorf("failed to query service status: %v", err)
			}
		}
	}
	
	// Import time package for sleep
	import "time"

	// Remove the service
	if err = s.Delete(); err != nil {
		return fmt.Errorf("failed to delete service: %v", err)
	}

	// Remove the event log
	if err = eventlog.Remove(name); err != nil {
		fmt.Printf("Warning: failed to remove event log: %v\n", err)
	}

	return nil
}