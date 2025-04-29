
import React from "react";
import { Button } from "@/components/ui/button";
import { useAlerts } from "@/context/AlertContext";
import { ShieldCheck } from "lucide-react";

const Header: React.FC = () => {
  const { alerts } = useAlerts();
  const newAlerts = alerts.filter(alert => alert.status === "new").length;

  return (
    <header className="border-b bg-card text-card-foreground shadow-sm">
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">LOLBins Defender</h1>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          {newAlerts > 0 && (
            <div className="bg-critical text-white px-2 py-0.5 rounded-full text-sm font-medium animate-pulse-slow">
              {newAlerts} New {newAlerts === 1 ? "Alert" : "Alerts"}
            </div>
          )}
          <span className="flex h-2 w-2 rounded-full bg-success animate-pulse-slow" />
          <span className="text-sm text-muted-foreground">Monitoring Active</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
