
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAlerts } from "@/context/AlertContext";
import { ShieldAlert } from "lucide-react";

const AlertNotification: React.FC = () => {
  const { alerts } = useAlerts();
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<string | null>(null);
  
  useEffect(() => {
    // Look for new alerts
    const newAlerts = alerts.filter(alert => alert.status === "new");
    
    if (newAlerts.length > 0 && !showAlert) {
      const latestAlert = newAlerts[0];
      setCurrentAlert(latestAlert.id);
      setShowAlert(true);
      
      // Hide after 8 seconds
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [alerts, showAlert]);
  
  if (!showAlert || !currentAlert) {
    return null;
  }
  
  const alert = alerts.find(a => a.id === currentAlert);
  if (!alert) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 max-w-sm z-50 alert-notification">
      <Card className="border-critical/30 bg-critical/10 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-critical/20">
              <ShieldAlert className="h-6 w-6 text-critical" />
            </div>
            <div>
              <h4 className="font-medium">LOLBin Alert</h4>
              <p className="text-sm text-muted-foreground">{alert.lolbin.name} detected</p>
            </div>
          </div>
          <p className="mt-2 text-sm">{alert.details}</p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 p-3 pt-0">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowAlert(false)}
          >
            Dismiss
          </Button>
          <Button 
            size="sm"
            onClick={() => {
              navigate(`/alert/${alert.id}`);
              setShowAlert(false);
            }}
          >
            View Details
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AlertNotification;
