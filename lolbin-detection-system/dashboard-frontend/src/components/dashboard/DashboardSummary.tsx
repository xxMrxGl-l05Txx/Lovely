
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAlerts } from "@/context/AlertContext";
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";

const DashboardSummary: React.FC = () => {
  const { alerts } = useAlerts();
  
  const totalAlerts = alerts.length;
  const newAlerts = alerts.filter(alert => alert.status === "new").length;
  const mitigatedAlerts = alerts.filter(alert => alert.status === "mitigated").length;
  const acknowledgedAlerts = alerts.filter(alert => alert.status === "acknowledged").length;
  const falsePositiveAlerts = alerts.filter(alert => alert.status === "false-positive").length;

  // Risk score calculation (simplified for demo)
  const criticalAlerts = alerts.filter(alert => alert.lolbin.riskLevel === "critical").length;
  const highAlerts = alerts.filter(alert => alert.lolbin.riskLevel === "high").length;
  
  // Calculate risk score (0-100)
  const riskScore = Math.min(100, Math.round(
    ((criticalAlerts * 20) + (highAlerts * 10) + (newAlerts * 5)) / (totalAlerts || 1)
  ));

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-critical";
    if (score >= 40) return "text-warning";
    return "text-success";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2 flex items-baseline">
            <span className={getScoreColor(riskScore)}>{riskScore}</span>
            <span className="text-xs text-muted-foreground ml-1">/100</span>
          </div>
          <Progress value={riskScore} className={`h-2 ${
            riskScore >= 70 ? "bg-critical/20" : 
            riskScore >= 40 ? "bg-warning/20" : 
            "bg-success/20"}`} 
          />
          <p className="text-xs text-muted-foreground mt-2">
            {riskScore >= 70 ? "Critical risk level" : 
             riskScore >= 40 ? "Moderate risk level" : 
             "Low risk level"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
          <ShieldAlert className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {newAlerts + acknowledgedAlerts}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {newAlerts > 0 ? `${newAlerts} new alert${newAlerts !== 1 ? 's' : ''} require attention` : "No new alerts"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Mitigated</CardTitle>
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {mitigatedAlerts}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {mitigatedAlerts > 0 
              ? `${Math.round((mitigatedAlerts / totalAlerts) * 100)}% of incidents resolved`
              : "No mitigated alerts"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">False Positives</CardTitle>
          <ShieldX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {falsePositiveAlerts}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {falsePositiveAlerts > 0
              ? `${Math.round((falsePositiveAlerts / totalAlerts) * 100)}% false detection rate`
              : "No false positives"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSummary;
