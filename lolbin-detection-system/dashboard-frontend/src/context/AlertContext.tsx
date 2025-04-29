
import React, { createContext, useContext, useState, useEffect } from "react";
import { DetectionAlert } from "../types";
import { toast } from "sonner";
import { fetchAlerts, fetchRecentEvents } from "../services/apiService";

type AlertContextType = {
  alerts: DetectionAlert[];
  addAlert: (alert: DetectionAlert) => void;
  updateAlert: (id: string, updatedAlert: Partial<DetectionAlert>) => void;
  getAlertById: (id: string) => DetectionAlert | undefined;
  acknowledgeAlert: (id: string) => void;
  mitigateAlert: (id: string) => void;
  markFalsePositive: (id: string) => void;
  clearAllAlerts: () => void;
  refreshAlerts: () => Promise<void>;
  isLoading: boolean;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [alerts, setAlerts] = useState<DetectionAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add a new alert
  const addAlert = (alert: DetectionAlert) => {
    setAlerts((prevAlerts) => [alert, ...prevAlerts]);
    
    // Show a toast notification
    toast(`${alert.lolbin.name} Alert`, {
      description: alert.details,
      duration: 5000,
    });

    // Display a simulated system alert
    simulateSystemAlert(alert);
  };

  // Update an existing alert
  const updateAlert = (id: string, updatedAlert: Partial<DetectionAlert>) => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) =>
        alert.id === id ? { ...alert, ...updatedAlert } : alert
      )
    );
  };

  // Get alert by ID
  const getAlertById = (id: string): DetectionAlert | undefined => {
    return alerts.find((alert) => alert.id === id);
  };

  // Mark an alert as acknowledged
  const acknowledgeAlert = (id: string) => {
    updateAlert(id, { status: "acknowledged" });
    toast.success("Alert acknowledged");
  };

  // Mark an alert as mitigated
  const mitigateAlert = (id: string) => {
    updateAlert(id, { status: "mitigated" });
    toast.success("Alert mitigated successfully");
  };

  // Mark an alert as false positive
  const markFalsePositive = (id: string) => {
    updateAlert(id, { status: "false-positive" });
    toast.info("Alert marked as false positive");
  };

  // Clear all alerts
  const clearAllAlerts = () => {
    setAlerts([]);
    toast.info("All alerts cleared");
  };

  // Refresh alerts from the backend
  const refreshAlerts = async () => {
    setIsLoading(true);
    try {
      const backendAlerts = await fetchAlerts();
      setAlerts(backendAlerts);
    } catch (error) {
      console.error("Failed to refresh alerts:", error);
      toast.error("Failed to refresh alerts");
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate system alert
  const simulateSystemAlert = (alert: DetectionAlert) => {
    // In a real app, this would trigger a native OS notification
    console.log("System alert triggered:", alert);
  };

  // Load initial alerts from the backend
  useEffect(() => {
    refreshAlerts();

    // Set up polling to periodically check for new alerts
    const intervalId = setInterval(() => {
      refreshAlerts();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <AlertContext.Provider
      value={{
        alerts,
        addAlert,
        updateAlert,
        getAlertById,
        acknowledgeAlert,
        mitigateAlert,
        markFalsePositive,
        clearAllAlerts,
        refreshAlerts,
        isLoading,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error("useAlerts must be used within an AlertProvider");
  }
  return context;
};