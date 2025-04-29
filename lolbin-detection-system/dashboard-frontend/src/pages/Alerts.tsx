
import React from "react";
import Layout from "@/components/layout/Layout";
import AlertTable from "@/components/alerts/AlertTable";
import { Button } from "@/components/ui/button";
import { useAlerts } from "@/context/AlertContext";
import { toast } from "sonner";
import { generateRandomAlert } from "@/services/lolbinsService";
import { ShieldAlert } from "lucide-react";

const Alerts: React.FC = () => {
  const { alerts, addAlert, clearAllAlerts } = useAlerts();
  
  const handleGenerateAlert = () => {
    const newAlert = generateRandomAlert();
    addAlert(newAlert);
    toast.success("Test alert generated");
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Alerts</h1>
            <p className="text-muted-foreground">
              {alerts.length} alerts detected
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleGenerateAlert}
            >
              <ShieldAlert className="mr-2 h-4 w-4" />
              Generate Test Alert
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={() => {
                clearAllAlerts();
                toast.success("All alerts cleared");
              }}
              disabled={alerts.length === 0}
            >
              Clear All
            </Button>
          </div>
        </div>
        
        <AlertTable />
      </div>
    </Layout>
  );
};

export default Alerts;
