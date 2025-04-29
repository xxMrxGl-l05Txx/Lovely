
import React from "react";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const SettingsForm: React.FC = () => {
  const [autoStart, setAutoStart] = React.useState(true);
  const [notifications, setNotifications] = React.useState(true);
  const [backgroundMonitoring, setBackgroundMonitoring] = React.useState(true);
  const [systemTrayAlerts, setSystemTrayAlerts] = React.useState(true);
  const [scanInterval, setScanInterval] = React.useState(30);
  
  const handleSaveSettings = () => {
    // In a real app, this would save to persistent storage
    toast.success("Settings saved successfully");
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>LOLBins Defender Settings</CardTitle>
        <CardDescription>
          Configure how the system monitors and alerts for suspicious LOLBins activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-start">Start on system boot</Label>
              <p className="text-sm text-muted-foreground">
                Automatically start monitoring when the system boots
              </p>
            </div>
            <Switch 
              id="auto-start" 
              checked={autoStart} 
              onCheckedChange={setAutoStart} 
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Dashboard notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show notifications in the dashboard when threats are detected
              </p>
            </div>
            <Switch 
              id="notifications" 
              checked={notifications} 
              onCheckedChange={setNotifications}
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="bg-monitoring">Background monitoring</Label>
              <p className="text-sm text-muted-foreground">
                Monitor system activity in the background
              </p>
            </div>
            <Switch 
              id="bg-monitoring" 
              checked={backgroundMonitoring} 
              onCheckedChange={setBackgroundMonitoring}
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sys-tray">System tray alerts</Label>
              <p className="text-sm text-muted-foreground">
                Show system tray notifications when threats are detected
              </p>
            </div>
            <Switch 
              id="sys-tray" 
              checked={systemTrayAlerts} 
              onCheckedChange={setSystemTrayAlerts}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="scan-interval">Scan interval (seconds)</Label>
          <div className="flex items-center gap-2">
            <input 
              type="range" 
              id="scan-interval"
              min="10" 
              max="60" 
              step="5"
              value={scanInterval}
              onChange={(e) => setScanInterval(parseInt(e.target.value))}
              className="w-full"
            />
            <span className="text-sm font-medium min-w-8 text-right">{scanInterval}s</span>
          </div>
          <p className="text-xs text-muted-foreground">
            How frequently the system checks for suspicious LOLBins activity
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSaveSettings}>Save Settings</Button>
      </CardFooter>
    </Card>
  );
};

export default SettingsForm;
