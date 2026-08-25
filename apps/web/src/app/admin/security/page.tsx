"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ShieldCheck, Activity, ShieldAlert, CloudFog } from "lucide-react";
import SecurityMetrics from "@/components/admin/security/SecurityMetrics";
import AuditLogTable from "@/components/admin/security/AuditLogTable";
import DisasterRecovery from "@/components/admin/security/DisasterRecovery";
import api from "@/lib/api";

export default function SecurityDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, auditRes] = await Promise.all([
          api.get("/security/dashboard"),
          api.get("/security/audit?limit=50")
        ]);
        setMetrics(dashboardRes.data.data);
        setAuditLogs(auditRes.data.data.logs);
      } catch (error) {
        console.error("Failed to load security data", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading security center...</div>;
  }

  return (
    <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-green-600 dark:text-green-500" />
            Security Command Center
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Enterprise Security, Compliance & Disaster Recovery Console
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg inline-flex">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" /> Audit Logs
          </TabsTrigger>
          <TabsTrigger value="recovery" className="flex items-center gap-2">
            <CloudFog className="h-4 w-4" /> Disaster Recovery
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {metrics && <SecurityMetrics metrics={metrics} />}
        </TabsContent>

        <TabsContent value="audit">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">System Audit Logs</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Immutable record of all critical system actions.</p>
            </div>
            <AuditLogTable logs={auditLogs} />
          </div>
        </TabsContent>

        <TabsContent value="recovery">
          <DisasterRecovery />
        </TabsContent>
      </Tabs>
    </div>
  );
}
