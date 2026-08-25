"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAdminVerificationStore } from "@/stores/adminVerificationStore";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";

export default function VerificationReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { activeRequest, fetchActiveRequest, approveRequest, rejectRequest } = useAdminVerificationStore();
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchActiveRequest(id);
  }, [id, fetchActiveRequest]);

  if (!activeRequest) {
    return <div className="p-6">Loading...</div>;
  }

  const handleApprove = async () => {
    await approveRequest(id, notes);
    router.push("/admin/dashboard/verification");
  };

  const handleReject = async () => {
    await rejectRequest(id, notes);
    router.push("/admin/dashboard/verification");
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] p-6 gap-6">
      <div className="flex-1 overflow-y-auto pr-4">
        <h1 className="text-2xl font-bold mb-2">Review Verification Request</h1>
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <p><strong>Role:</strong> {activeRequest.role}</p>
          <p><strong>User Info:</strong> {activeRequest.users?.email || activeRequest.users?.phone}</p>
          <p><strong>Status:</strong> {activeRequest.status}</p>
        </div>

        <h2 className="text-xl font-semibold mb-4">Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeRequest.documents?.map((doc: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
              <h3 className="font-medium mb-2">{doc.document_type}</h3>
              <div className="w-full h-64 bg-gray-100 rounded overflow-hidden">
                {doc.file_url?.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                  <img src={doc.file_url} alt={doc.document_type} className="w-full h-full object-contain" />
                ) : (
                  <iframe src={doc.file_url} className="w-full h-full" title={doc.document_type} />
                )}
              </div>
            </div>
          ))}
          {(!activeRequest.documents || activeRequest.documents.length === 0) && (
             <p className="text-gray-500">No documents found for this request.</p>
          )}
        </div>
      </div>

      <div className="w-80 flex flex-col gap-4 border-l pl-6">
        <h2 className="text-xl font-semibold">Action Panel</h2>
        <div className="flex flex-col gap-2 flex-1">
          <label htmlFor="notes" className="font-medium">Notes / Rejection Reason</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full flex-1 min-h-[200px] p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter reason or notes here..."
          />
        </div>
        <div className="flex flex-col gap-3 mt-auto">
          <Button onClick={handleApprove} className="w-full bg-green-600 hover:bg-green-700 text-white">
            Approve
          </Button>
          <Button onClick={handleReject} variant="danger" className="w-full">
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}
