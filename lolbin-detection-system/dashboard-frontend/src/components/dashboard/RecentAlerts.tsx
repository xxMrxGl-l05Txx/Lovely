
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAlerts } from "@/context/AlertContext";
import { formatDate } from "@/services/lolbinsService";

const RecentAlerts: React.FC = () => {
  const { alerts, acknowledgeAlert } = useAlerts();
  const navigate = useNavigate();
  
  // Get the most recent 5 alerts
  const recentAlerts = alerts
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-critical";
      case "acknowledged": return "bg-warning";
      case "mitigated": return "bg-success";
      case "false-positive": return "bg-muted";
      default: return "bg-muted";
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-critical";
      case "high": return "bg-warning";
      case "medium": return "bg-info";
      case "low": return "bg-success";
      default: return "bg-muted";
    }
  };

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>
            {recentAlerts.length > 0 
              ? "Most recent LOLBins detections" 
              : "No recent alerts detected"}
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/alerts")}
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentAlerts.length > 0 ? (
            recentAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-3 rounded-lg border ${
                  alert.status === "new" ? "border-critical/30 bg-critical/5" : "border-border"
                }`}
              >
                <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getRiskLevelColor(alert.lolbin.riskLevel)}>
                      {alert.lolbin.riskLevel}
                    </Badge>
                    <div className="font-medium">{alert.lolbin.name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(alert.status)}>
                      {alert.status.replace("-", " ")}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(alert.timestamp)}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{alert.details}</p>
                <div className="text-xs bg-secondary p-1.5 rounded font-mono truncate">
                  {alert.command}
                </div>
                <div className="flex justify-between mt-3">
                  <div className="text-xs text-muted-foreground">
                    System: {alert.affectedSystem}
                  </div>
                  <div className="flex gap-2">
                    {alert.status === "new" && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                    <Button 
                      size="sm"
                      onClick={() => navigate(`/alert/${alert.id}`)}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No recent alerts detected. Your system is currently secure.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentAlerts;
