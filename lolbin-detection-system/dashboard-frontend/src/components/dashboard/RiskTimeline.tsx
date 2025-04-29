
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { useAlerts } from "@/context/AlertContext";

const RiskTimeline: React.FC = () => {
  const { alerts } = useAlerts();
  
  // Generate timeline data (last 7 days)
  const timelineData = React.useMemo(() => {
    const days = 7;
    const data = [];
    const now = new Date();
    
    // Initialize days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStr = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      
      data.push({
        date: dayStr,
        timestamp: date.getTime(),
        risk: 0,
        alerts: 0
      });
    }
    
    // Add alerts to days
    alerts.forEach(alert => {
      const alertDate = new Date(alert.timestamp);
      
      // Find matching day
      const dayEntry = data.find(d => {
        const entryDate = new Date(d.timestamp);
        return entryDate.toDateString() === alertDate.toDateString();
      });
      
      if (dayEntry) {
        dayEntry.alerts += 1;
        
        // Add risk score based on severity
        if (alert.lolbin.riskLevel === "critical") {
          dayEntry.risk += 30;
        } else if (alert.lolbin.riskLevel === "high") {
          dayEntry.risk += 15;
        } else {
          dayEntry.risk += 5;
        }
      }
    });
    
    // Cap risk score at 100
    data.forEach(day => {
      day.risk = Math.min(100, day.risk);
    });
    
    return data;
  }, [alerts]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground p-2 rounded shadow-md border text-sm">
          <p className="font-medium">{label}</p>
          <p>Risk Score: {payload[0].value}</p>
          <p>Alerts: {payload[1].payload.alerts}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Risk Timeline</CardTitle>
        <CardDescription>
          System risk score over the past 7 days
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={timelineData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="var(--muted-foreground)" 
              fontSize={12} 
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
            />
            <YAxis 
              stroke="var(--muted-foreground)" 
              fontSize={12} 
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
              domain={[0, 100]}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="risk" 
              stroke="var(--primary)" 
              strokeWidth={2} 
              dot={{ fill: 'var(--background)', stroke: 'var(--primary)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: 'var(--primary)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RiskTimeline;
