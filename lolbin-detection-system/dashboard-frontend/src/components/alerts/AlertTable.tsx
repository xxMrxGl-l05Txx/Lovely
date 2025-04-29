
import React, { useState } from "react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAlerts } from "@/context/AlertContext";
import { formatDate } from "@/services/lolbinsService";
import { useNavigate } from "react-router-dom";

const AlertTable: React.FC = () => {
  const { alerts } = useAlerts();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");
  
  const filteredAlerts = alerts.filter(alert => 
    alert.lolbin.name.toLowerCase().includes(filter.toLowerCase()) ||
    alert.status.toLowerCase().includes(filter.toLowerCase()) ||
    alert.lolbin.riskLevel.toLowerCase().includes(filter.toLowerCase()) ||
    alert.details.toLowerCase().includes(filter.toLowerCase()) ||
    alert.command.toLowerCase().includes(filter.toLowerCase())
  );
  
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-critical";
      case "high": return "bg-warning";
      case "medium": return "bg-info";
      case "low": return "bg-success";
      default: return "bg-muted";
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-critical";
      case "acknowledged": return "bg-warning";
      case "mitigated": return "bg-success";
      case "false-positive": return "bg-muted";
      default: return "bg-muted";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Filter alerts..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
        <div className="text-sm text-muted-foreground">
          {filteredAlerts.length} alerts found
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>LOLBin</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Command</TableHead>
              <TableHead className="hidden md:table-cell">Timestamp</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <TableRow 
                  key={alert.id} 
                  className={alert.status === "new" ? "bg-critical/5" : undefined}
                >
                  <TableCell className="font-medium">
                    {alert.lolbin.name}
                  </TableCell>
                  <TableCell>
                    <Badge className={getRiskLevelColor(alert.lolbin.riskLevel)}>
                      {alert.lolbin.riskLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(alert.status)}>
                      {alert.status.replace("-", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="max-w-xs truncate text-xs">
                      {alert.command}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs">
                    {formatDate(alert.timestamp)}
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      onClick={() => navigate(`/alert/${alert.id}`)}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No alerts found matching your filter
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AlertTable;
