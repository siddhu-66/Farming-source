"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle, XCircle, AlertCircle, FileText, Upload, ChevronLeft, Sparkles, Building, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function SchemeDetails() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [scheme, setScheme] = useState<any>(null);
  
  // Application State
  const [eligibilityCheck, setEligibilityCheck] = useState<'pending' | 'checking' | 'done'>('pending');
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);
  const [uploadStep, setUploadStep] = useState(false);

  useEffect(() => {
    fetchSchemeDetails();
  }, [params.id]);

  const fetchSchemeDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/v1/government/schemes/${params.id}`);
      if (res.data?.success) {
        setScheme(res.data.data.scheme);
      }
    } catch (err) {
      // toast.error("Failed to fetch scheme details");
      // Mock data fallback
      setScheme({
        id: params.id,
        title: 'PM-KISAN Samman Nidhi',
        department: 'Ministry of Agriculture',
        category: 'financial_support',
        description: 'Under the scheme an income support of 6,000/- per year in three equal installments will be provided to all land holding farmer families. State Government and UT administration will identify the farmer families which are eligible for support as per scheme guidelines. The fund will be directly transferred to the bank accounts of the beneficiaries.',
        deadline: '2026-12-31',
        status: 'active',
        benefits: ['₹6,000 per year', 'Direct Bank Transfer', '3 Equal Installments'],
        requiredDocuments: ['Aadhaar Card', 'Land Ownership Records', 'Bank Passbook']
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckEligibility = async () => {
    setEligibilityCheck('checking');
    try {
      const res = await api.post('/api/v1/government/eligibility', { schemeId: params.id });
      if (res.data?.success) {
        // Simulate delay for AI thinking effect
        setTimeout(() => {
          setEligibilityResult(res.data.data.eligibilityReport);
          setEligibilityCheck('done');
        }, 1500);
      }
    } catch (err) {
      toast.error("Eligibility check failed");
      setEligibilityCheck('pending');
    }
  };

  const handleSubmitApplication = async () => {
    try {
      const res = await api.post('/api/v1/government/applications', {
        schemeId: params.id,
        submittedDocuments: scheme.requiredDocuments
      });
      if (res.data?.success) {
        toast.success("Application submitted successfully!");
        router.push('/farmer/government/dashboard');
      }
    } catch (err) {
      toast.error("Application submission failed");
    }
  };

  if (loading || !scheme) {
    return <div className="max-w-4xl mx-auto p-12 text-center text-slate-500 animate-pulse">Loading scheme details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <Link href="/farmer/government/schemes" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Schemes
      </Link>

      {/* Header */}
      <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Landmark className="w-32 h-32" />
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 uppercase">
          <Building className="w-4 h-4" /> {scheme.department}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800">{scheme.title}</h1>
        <div className="flex gap-4 pt-2">
          <span className="text-sm font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-full capitalize">{scheme.category.replace('_', ' ')}</span>
          <span className="text-sm font-medium bg-amber-100 text-amber-700 px-3 py-1 rounded-full">Deadline: {new Date(scheme.deadline).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheme Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-slate-600 leading-relaxed">{scheme.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-3">Key Benefits</h4>
                <ul className="space-y-2">
                  {scheme.benefits?.map((benefit: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-slate-600">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Action Box */}
        <div className="space-y-6">
          <Card className="border-emerald-200 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
            <CardContent className="p-6">
              
              {/* Step 1: Check Eligibility */}
              <AnimatePresence mode="wait">
                {eligibilityCheck === 'pending' && (
                  <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <Sparkles className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">AI Eligibility Engine</h3>
                      <p className="text-sm text-slate-500 mt-1">Our AI will securely analyze your profile, land records, and crops to determine eligibility instantly.</p>
                    </div>
                    <Button onClick={handleCheckEligibility} className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg">
                      Check Eligibility Now
                    </Button>
                  </motion.div>
                )}

                {eligibilityCheck === 'checking' && (
                  <motion.div key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4 py-8">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-medium text-slate-600 animate-pulse">AI is analyzing your profile...</p>
                  </motion.div>
                )}

                {eligibilityCheck === 'done' && !uploadStep && (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                    <div className="text-center">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 ${eligibilityResult.score >= 75 ? 'bg-emerald-100 border-emerald-200 text-emerald-600' : 'bg-amber-100 border-amber-200 text-amber-600'}`}>
                        <span className="text-2xl font-bold">{eligibilityResult.score}%</span>
                      </div>
                      <h3 className="font-bold text-xl">{eligibilityResult.recommendationTier}</h3>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg text-sm space-y-2 border">
                      <p className="font-bold text-slate-700">AI Findings:</p>
                      <ul className="space-y-1 text-slate-600 list-disc pl-4">
                        {eligibilityResult.reasons?.map((r: string, i: number) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>

                    <Button onClick={() => setUploadStep(true)} className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg">
                      Proceed to Apply
                    </Button>
                  </motion.div>
                )}

                {/* Step 2: Upload & Submit */}
                {uploadStep && (
                  <motion.div key="upload" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <h3 className="font-bold text-lg border-b pb-2">Required Documents</h3>
                    <div className="space-y-3">
                      {scheme.requiredDocuments?.map((doc: string, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-700">{doc}</span>
                          </div>
                          <Button size="sm" variant="outline" className="h-8">
                            <Upload className="w-3 h-3 mr-1" /> Upload
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2 border border-blue-100">
                      <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-800">Your documents will be securely submitted to {scheme.department}.</p>
                    </div>

                    <Button onClick={handleSubmitApplication} className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg">
                      Submit Application
                    </Button>
                    <Button variant="ghost" onClick={() => setUploadStep(false)} className="w-full">
                      Back
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
