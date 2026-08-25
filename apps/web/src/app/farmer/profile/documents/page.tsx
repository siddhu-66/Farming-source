"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader2, UploadCloud, FileCheck, ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { useFarmerProfileStore } from "@/stores/useFarmerProfileStore";
import { Badge } from "@/components/ui/Badge";

const DOCUMENT_TYPES = [
  { id: "aadhaar", name: "Aadhaar Card", description: "Identity Verification" },
  { id: "pan", name: "PAN Card", description: "Financial Verification" },
  { id: "land_ownership", name: "Land Ownership Record (Pattadar Passbook)", description: "Farm Verification" },
];

export default function DocumentsPage() {
  const { profile, fetchProfile } = useFarmerProfileStore();
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[], docType: string) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    
    setUploadingId(docType);
    try {
      // In a real application, upload to Supabase Storage first and get URL.
      // Here we mock the URL or send as base64. For this prototype, we'll just 
      // tell the backend that a document was uploaded with a mock URL.
      
      const payload = {
        documentType: docType,
        fileUrl: `https://fake-storage.com/${file.name}`,
      };

      const res = await api.post('/farmer/documents/upload', payload);
      if (res.data?.success) {
        toast.success(`${docType.replace('_', ' ')} uploaded successfully`);
        await fetchProfile(); // re-fetch to update verification status
      }
    } catch (err) {
      toast.error(`Failed to upload ${docType}`);
    } finally {
      setUploadingId(null);
    }
  }, [fetchProfile]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Documents & KYC</h2>
        <p className="text-muted-foreground">Upload official documents to verify your identity and farm ownership.</p>
      </div>

      <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900">
        <CardContent className="p-4 flex items-start gap-4">
          <ShieldAlert className="w-8 h-8 text-amber-600 mt-1" />
          <div>
            <h3 className="font-semibold text-amber-800 dark:text-amber-500">Why verify?</h3>
            <p className="text-sm text-amber-700/80 dark:text-amber-400/80">
              Verifying your profile gives you a "Verified Farmer" badge, builds trust with buyers in the marketplace, and is required to apply for government schemes and loans.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DOCUMENT_TYPES.map((doc) => {
          return (
            <DocumentUploader
              key={doc.id}
              doc={doc}
              isUploading={uploadingId === doc.id}
              onDrop={(files: File[]) => onDrop(files, doc.id)}
            />
          );
        })}
      </div>
      
      {/* Verification Status Banner */}
      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
            {profile?.verificationStatus === 'Verified' ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            ) : profile?.verificationStatus === 'Pending' ? (
              <Clock className="w-8 h-8 text-amber-500" />
            ) : (
              <FileCheck className="w-8 h-8 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium text-lg">
                {profile?.verificationStatus || 'Draft / Unverified'}
              </p>
              <p className="text-sm text-muted-foreground">
                {profile?.verificationStatus === 'Verified' 
                  ? "Your account is fully verified."
                  : profile?.verificationStatus === 'Pending'
                  ? "Your documents are under review by the admin team."
                  : "Please upload the required documents to begin verification."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DocumentUploader({ doc, isUploading, onDrop }: any) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{doc.name}</CardTitle>
        <CardDescription>{doc.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-muted-foreground/25 hover:border-emerald-500/50 hover:bg-muted/50'}
            ${isUploading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <span className="text-sm font-medium">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <UploadCloud className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm font-medium">Drag & drop or click to upload</p>
              <p className="text-xs text-muted-foreground">PDF, JPG, PNG up to 5MB</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
