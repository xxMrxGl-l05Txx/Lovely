/**
 * API Service for communicating with the LOLBin Monitor backend
 */
import { DetectionAlert, LOLBin } from "../types";
import { toast } from "sonner";

// API base URL - adjust to your Go service address
// Since Vite is running on port 8080, let's change this to another port
// Change this to match your backend port
const API_BASE_URL = "http://localhost:3000/api";

/**
 * Fetch all alerts from the backend
 */
export const fetchAlerts = async (): Promise<DetectionAlert[]> => {
  try {
    // For development, return mock data if backend is not available
    // Attempt to fetch from real API
    const response = await fetch(`${API_BASE_URL}/events/suspicious`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    // The API returns events, map them to our frontend alert format
    const events = await response.json();
    return mapEventsToAlerts(events);
  } catch (error) {
    console.error("Failed to fetch alerts:", error);
    toast.error("Failed to connect to monitoring service");
    
    // During development, generate some mock alerts
    const { generateRandomAlert } = await import("./lolbinsService");
    return Array.from({ length: 5 }, () => generateRandomAlert());
  }
};

/**
 * Fetch recent events from the backend
 */
export const fetchRecentEvents = async (): Promise<DetectionAlert[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/recent`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const events = await response.json();
    return mapEventsToAlerts(events);
  } catch (error) {
    console.error("Failed to fetch recent events:", error);
    // Return empty array to avoid breaking the UI
    return [];
  }
};

/**
 * Fetch LOLBin definitions from the backend
 */
export const fetchLOLBins = async (): Promise<Record<string, LOLBin>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/lolbins`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch LOLBin definitions:", error);
    // Return empty object to avoid breaking the UI
    return {};
  }
};

/**
 * Map backend events to frontend alert format
 */
const mapEventsToAlerts = (events: any[]): DetectionAlert[] => {
  return events
    .filter(event => event.suspicious)
    .map(event => {
      // Extract executable name from path
      const pathParts = event.executable_path.split('\\');
      const executableName = pathParts[pathParts.length - 1].toLowerCase();
      
      return {
        id: `alert-${event.process_id}-${Date.now()}`,
        timestamp: new Date(event.timestamp).getTime(),
        status: "new",
        affectedSystem: "Local System",
        command: event.command_line,
        process: executableName,
        details: event.reason || `Suspicious ${executableName} execution detected`,
        lolbin: {
          name: executableName,
          description: `Windows LOLBin: ${executableName}`,
          mitreTechniques: [], // Required property for LOLBin interface
          path: event.executable_path || `C:\\Windows\\System32\\${executableName}`, // Required property
          type: "binary", // Required property
          riskLevel: determineRiskLevel(executableName)
        }
      };
    });
};

/**
 * Determine risk level based on LOLBin type
 */
const determineRiskLevel = (lolbinName: string): "critical" | "high" | "medium" | "low" => {
  const criticalLOLBins = ["certutil.exe", "regsvr32.exe", "rundll32.exe", "mshta.exe"];
  const highLOLBins = ["powershell.exe", "wmic.exe", "bitsadmin.exe"];
  const mediumLOLBins = ["cmd.exe", "msiexec.exe", "sc.exe"];
  
  if (criticalLOLBins.includes(lolbinName.toLowerCase())) {
    return "critical";
  } else if (highLOLBins.includes(lolbinName.toLowerCase())) {
    return "high";
  } else if (mediumLOLBins.includes(lolbinName.toLowerCase())) {
    return "medium";
  } else {
    return "low";
  }
};