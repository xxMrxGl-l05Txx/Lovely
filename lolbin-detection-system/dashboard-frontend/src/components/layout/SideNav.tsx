
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Bell, 
  FileText, 
  Settings,
  ShieldAlert
} from "lucide-react";
import { useAlerts } from "@/context/AlertContext";

const navItems = [
  {
    icon: LayoutDashboard,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: Bell,
    name: "Alerts",
    path: "/alerts",
  },
  {
    icon: FileText,
    name: "Reports",
    path: "/reports",
  },
  {
    icon: Settings,
    name: "Settings",
    path: "/settings",
  },
];

const SideNav: React.FC = () => {
  const location = useLocation();
  const { alerts } = useAlerts();
  const newAlerts = alerts.filter(alert => alert.status === "new").length;

  return (
    <aside className="w-16 md:w-64 h-screen fixed left-0 top-16 border-r bg-sidebar">
      <div className="flex flex-col h-full py-4 px-2">
        <nav className="space-y-1 mt-5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="hidden md:inline">{item.name}</span>
                {item.name === "Alerts" && newAlerts > 0 && (
                  <div className="ml-auto bg-critical text-white px-2 py-0.5 rounded-full text-xs">
                    {newAlerts}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-2">
          <div className="p-3 bg-sidebar-accent rounded-md mb-2">
            <div className="flex items-center">
              <ShieldAlert className="h-5 w-5 text-primary mr-2" />
              <div className="hidden md:block text-xs text-sidebar-foreground">
                <span className="font-medium">Real-time monitoring active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SideNav;
