
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, ArrowLeft, Check, Info, ShieldX } from "lucide-react";
import { useAlerts } from "@/context/AlertContext";
import { formatDate, getMitreTechniqueDetails } from "@/services/lolbinsService";

const AlertDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAlertById, acknowledgeAlert, mitigateAlert, markFalsePositive } = useAlerts();
  
  const alert = id ? getAlertById(id) : undefined;

  if (!alert) {
    return (
      <div className="flex flex-col items-center justify-center h-full my-12">
        <h1 className="text-2xl font-bold mb-4">Alert Not Found</h1>
        <p className="text-muted-foreground mb-6">The alert you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/alerts")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Alerts
        </Button>
      </div>
    );
  }

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/alerts")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Alerts
        </Button>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(alert.status)}>
            {alert.status.replace("-", " ")}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Detected on {formatDate(alert.timestamp)}
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{alert.lolbin.name} Detection</CardTitle>
              <CardDescription>{alert.details}</CardDescription>
            </div>
            <Badge className={`${getRiskLevelColor(alert.lolbin.riskLevel)} text-base py-1 px-3`}>
              {alert.lolbin.riskLevel} risk
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Execution Details</h3>
            <div className="bg-secondary p-3 rounded-lg text-sm font-mono overflow-x-auto">
              {alert.command}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Process: {alert.process} | System: {alert.affectedSystem}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">LOLBin Information</h3>
            <p className="text-sm mb-3">{alert.lolbin.description}</p>
            <div className="text-sm">
              <span className="text-muted-foreground">Path: </span> 
              {alert.lolbin.path}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-2">MITRE ATT&CK Techniques</h3>
            <div className="space-y-4">
              {alert.lolbin.mitreTechniques.map(techniqueId => {
                const technique = getMitreTechniqueDetails(techniqueId);
                return technique ? (
                  <div key={technique.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium flex items-center">
                        <Info className="h-4 w-4 mr-2 text-info" />
                        {technique.id}: {technique.name}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(technique.url, '_blank')}
                      >
                        View on MITRE
                      </Button>
                    </div>
                    <p className="text-sm mb-3">{technique.description}</p>
                    <div className="bg-secondary rounded-lg p-2.5 text-sm">
                      <span className="font-medium">Mitigation: </span> 
                      {technique.mitigation}
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2 justify-end">
          {alert.status === "new" && (
            <Button 
              variant="outline" 
              onClick={() => acknowledgeAlert(alert.id)}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Acknowledge
            </Button>
          )}
          {(alert.status === "new" || alert.status === "acknowledged") && (
            <>
              <Button 
                variant="outline" 
                onClick={() => markFalsePositive(alert.id)}
              >
                <ShieldX className="mr-2 h-4 w-4" />
                Mark False Positive
              </Button>
              <Button 
                onClick={() => mitigateAlert(alert.id)}
              >
                <Check className="mr-2 h-4 w-4" />
                Mitigate
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default AlertDetail;
