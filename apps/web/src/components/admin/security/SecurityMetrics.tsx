"use client";

import { motion } from "framer-motion";
import { Shield, ShieldAlert, Activity, UserX, Database, Lock, ServerCrash, Key } from "lucide-react";

interface SecurityMetricsProps {
  metrics: {
    activeSessions: number;
    failedLoginsToday: number;
    otpSuccessRate: number;
    apiRequestsMinute: number;
    blockedUsers: number;
    storageUsageGB: number;
    securityAlerts: number;
  };
}

export default function SecurityMetrics({ metrics }: SecurityMetricsProps) {
  const cards = [
    {
      title: "Active Sessions",
      value: metrics.activeSessions.toLocaleString(),
      icon: Activity,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      trend: "+12% from yesterday",
    },
    {
      title: "Failed Logins",
      value: metrics.failedLoginsToday.toLocaleString(),
      icon: ShieldAlert,
      color: metrics.failedLoginsToday > 50 ? "text-red-500" : "text-amber-500",
      bg: metrics.failedLoginsToday > 50 ? "bg-red-500/10" : "bg-amber-500/10",
      trend: "Past 24 hours",
    },
    {
      title: "OTP Success Rate",
      value: `${metrics.otpSuccessRate}%`,
      icon: Key,
      color: "text-green-500",
      bg: "bg-green-500/10",
      trend: "Consistent",
    },
    {
      title: "Blocked Users/IPs",
      value: metrics.blockedUsers.toLocaleString(),
      icon: UserX,
      color: "text-red-500",
      bg: "bg-red-500/10",
      trend: "+2 new blocks today",
    },
    {
      title: "API Req/Min",
      value: metrics.apiRequestsMinute.toLocaleString(),
      icon: ServerCrash,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      trend: "Normal load",
    },
    {
      title: "Active Alerts",
      value: metrics.securityAlerts.toLocaleString(),
      icon: Shield,
      color: metrics.securityAlerts > 0 ? "text-red-500" : "text-green-500",
      bg: metrics.securityAlerts > 0 ? "bg-red-500/10" : "bg-green-500/10",
      trend: "Requires attention",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {card.title}
              </p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {card.value}
              </h3>
            </div>
            <div className={`p-3 rounded-lg ${card.bg}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              {card.trend}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
