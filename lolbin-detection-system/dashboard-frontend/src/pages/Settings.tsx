
import React from "react";
import Layout from "@/components/layout/Layout";
import SettingsForm from "@/components/settings/SettingsForm";

const Settings: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        
        <SettingsForm />
      </div>
    </Layout>
  );
};

export default Settings;
