
import React from "react";
import Layout from "@/components/layout/Layout";
import ReportGenerator from "@/components/reports/ReportGenerator";

const Reports: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Reports</h1>
        </div>
        
        <ReportGenerator />
      </div>
    </Layout>
  );
};

export default Reports;
