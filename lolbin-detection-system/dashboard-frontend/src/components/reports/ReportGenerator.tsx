
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { FileText } from "lucide-react";
import { useAlerts } from "@/context/AlertContext";
import { toast } from "sonner";
import { formatDate } from "@/services/lolbinsService";

const ReportGenerator: React.FC = () => {
  const { alerts } = useAlerts();
  const [timeRange, setTimeRange] = useState("all");
  const [includeDetails, setIncludeDetails] = useState(true);
  const [includeMitre, setIncludeMitre] = useState(true);
  const [includeCommands, setIncludeCommands] = useState(true);
  const [generating, setGenerating] = useState(false);

  const generateReport = () => {
    setGenerating(true);
    
    // In a real application, this would generate a PDF or other report format
    setTimeout(() => {
      toast.success("Report generated successfully");
      setGenerating(false);
      
      // In a real application, we would provide a download link
      // or display the report in a new window
    }, 1500);
  };

  const filteredAlerts = alerts.filter(alert => {
    if (timeRange === "all") return true;
    
    const now = Date.now();
    const alertTime = alert.timestamp;
    const timeDiff = now - alertTime;
    
    switch(timeRange) {
      case "day":
        return timeDiff < 24 * 60 * 60 * 1000; // 24 hours in ms
      case "week":
        return timeDiff < 7 * 24 * 60 * 60 * 1000; // 7 days in ms
      case "month":
        return timeDiff < 30 * 24 * 60 * 60 * 1000; // 30 days in ms
      default:
        return true;
    }
  });

  // Calculate some statistics for the preview
  const criticalCount = filteredAlerts.filter(a => a.lolbin.riskLevel === "critical").length;
  const highCount = filteredAlerts.filter(a => a.lolbin.riskLevel === "high").length;
  const mitigatedCount = filteredAlerts.filter(a => a.status === "mitigated").length;
  const activeCount = filteredAlerts.filter(a => a.status === "new" || a.status === "acknowledged").length;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Security Report</CardTitle>
          <CardDescription>
            Create a detailed report of LOLBins detections and mitigations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Time Range</Label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full max-w-sm">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="day">Last 24 Hours</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Report Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="details" 
                  checked={includeDetails} 
                  onCheckedChange={(checked) => setIncludeDetails(!!checked)} 
                />
                <Label htmlFor="details">Include detailed descriptions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="mitre" 
                  checked={includeMitre} 
                  onCheckedChange={(checked) => setIncludeMitre(!!checked)} 
                />
                <Label htmlFor="mitre">Include MITRE ATT&CK references</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="commands" 
                  checked={includeCommands} 
                  onCheckedChange={(checked) => setIncludeCommands(!!checked)} 
                />
                <Label htmlFor="commands">Include command executions</Label>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-secondary/30">
            <h3 className="font-medium mb-3">Report Preview</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Report period:</span>
                <span>
                  {timeRange === "all" ? "All time" : 
                   timeRange === "day" ? "Last 24 hours" :
                   timeRange === "week" ? "Last 7 days" : "Last 30 days"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Alerts included:</span>
                <span>{filteredAlerts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Critical alerts:</span>
                <span>{criticalCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">High risk alerts:</span>
                <span>{highCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active alerts:</span>
                <span>{activeCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mitigated alerts:</span>
                <span>{mitigatedCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Report generated:</span>
                <span>{formatDate(Date.now())}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={generateReport} 
            disabled={generating || filteredAlerts.length === 0}
          >
            <FileText className="mr-2 h-4 w-4" />
            {generating ? "Generating..." : "Generate Report"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ReportGenerator;
