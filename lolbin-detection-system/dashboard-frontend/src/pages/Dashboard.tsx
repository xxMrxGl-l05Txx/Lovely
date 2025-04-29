
import React from "react";
import Layout from "@/components/layout/Layout";
import DashboardSummary from "@/components/dashboard/DashboardSummary";
import RecentAlerts from "@/components/dashboard/RecentAlerts";
import ThreatDistribution from "@/components/dashboard/ThreatDistribution";
import RiskTimeline from "@/components/dashboard/RiskTimeline";

const Dashboard: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        
        <DashboardSummary />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecentAlerts />
          <div className="space-y-6">
            <ThreatDistribution />
            <RiskTimeline />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
