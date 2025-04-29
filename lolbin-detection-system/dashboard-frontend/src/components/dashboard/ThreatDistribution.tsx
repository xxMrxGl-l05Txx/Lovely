
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useAlerts } from "@/context/AlertContext";

const colors = ["#FF453A", "#FF9F0A", "#32D74B", "#0A84FF", "#5E5CE6"];

const ThreatDistribution: React.FC = () => {
  const { alerts } = useAlerts();

  // Count alerts by LOLBin type
  const distribution = React.useMemo(() => {
    const counts: Record<string, number> = {};
    
    alerts.forEach(alert => {
      const name = alert.lolbin.name;
      counts[name] = (counts[name] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [alerts]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground p-2 rounded shadow-md border text-sm">
          <p>{`${payload[0].name}: ${payload[0].value} alerts`}</p>
        </div>
      );
    }
    return null;
  };

  const total = distribution.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Threat Distribution</CardTitle>
        <CardDescription>
          {total > 0 
            ? "Breakdown of detected LOLBins threats" 
            : "No threats detected"}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        {total > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {distribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No data to display
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ThreatDistribution;
