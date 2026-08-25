"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Search, Filter, ShieldAlert, ShieldCheck, Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity: string;
  entity_id: string | null;
  metadata: any;
  created_at: string;
  user?: {
    full_name: string;
    role: string;
  };
}

interface AuditLogTableProps {
  logs: AuditLog[];
}

export default function AuditLogTable({ logs }: AuditLogTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = logs.filter((log) => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionBadge = (action: string) => {
    if (action.includes("LOGIN") || action.includes("REGISTER") || action.includes("SUCCESS")) {
      return <Badge variant="success" className="flex gap-1 items-center"><ShieldCheck className="h-3 w-3"/> {action}</Badge>;
    }
    if (action.includes("FAILED") || action.includes("DELETE") || action.includes("BLOCK")) {
      return <Badge variant="danger" className="flex gap-1 items-center"><ShieldAlert className="h-3 w-3"/> {action}</Badge>;
    }
    if (action.includes("UPDATE") || action.includes("MODIFY") || action.includes("RESTORE")) {
      return <Badge variant="warning">{action}</Badge>;
    }
    return <Badge variant="default" className="flex gap-1 items-center"><Info className="h-3 w-3"/> {action}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs by action, user, or entity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 outline-none transition-all dark:text-white"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" /> Filter
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Timestamp</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">Entity</th>
                <th className="px-6 py-4 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(log.created_at), "PP HH:mm:ss")}
                    </td>
                    <td className="px-6 py-4">
                      {log.user ? (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{log.user.full_name}</p>
                          <p className="text-xs text-gray-500 uppercase">{log.user.role}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">System / Unknown</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {log.entity} {log.entity_id ? `(${log.entity_id.substring(0, 8)}...)` : ""}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate text-xs font-mono">
                        {log.metadata ? JSON.stringify(log.metadata) : "-"}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
