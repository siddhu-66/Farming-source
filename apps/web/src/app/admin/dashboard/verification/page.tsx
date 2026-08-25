"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminVerificationStore } from "@/stores/adminVerificationStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Search, Filter } from "lucide-react";

export default function VerificationQueuePage() {
  const router = useRouter();
  const { queue, fetchQueue } = useAdminVerificationStore();
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const filteredQueue = queue?.filter((item: any) => {
    if (roleFilter !== "All" && item.role !== roleFilter) return false;
    if (statusFilter !== "All" && item.status !== statusFilter) return false;
    return true;
  }) || [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Verification Queue</h1>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 border p-2 rounded-md">
            <Filter size={16} />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent outline-none"
            >
              <option value="All">All Roles</option>
              <option value="Farmer">Farmer</option>
              <option value="Buyer">Buyer</option>
              <option value="Transport">Transport</option>
              <option value="Industry">Industry</option>
            </select>
          </div>
          <div className="flex items-center gap-2 border p-2 rounded-md">
            <Filter size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date Submitted</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>User Email/Mobile</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQueue.map((req: any) => (
              <TableRow key={req.id}>
                <TableCell>{req.submitted_at ? new Date(req.submitted_at).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>{req.role}</TableCell>
                <TableCell>{req.users?.email || req.users?.phone || 'N/A'}</TableCell>
                <TableCell>{req.status}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => router.push(`/admin/dashboard/verification/${req.id}`)}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredQueue.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                  No verification requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
