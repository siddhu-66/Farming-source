"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, FileText, CheckCircle, Clock, Search, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function InsuranceDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    policies: [] as any[],
    claims: [] as any[]
  });
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimForm, setClaimForm] = useState({
    policyId: '',
    incidentDate: '',
    damageDescription: '',
    requestedAmount: ''
  });

  useEffect(() => {
    fetchInsuranceData();
  }, []);

  const fetchInsuranceData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/insurance');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      // Mock data fallback
      setData({
        policies: [
          {
            id: 'pol-1',
            policyNumber: 'INS-2026-9842',
            provider: 'PMFBY',
            policyType: 'Weather-Based Crop Insurance',
            coverageAmount: 500000,
            premiumAmount: 12000,
            status: 'active',
            endDate: '2026-12-31'
          }
        ],
        claims: [
          {
            id: 'clm-1',
            incidentDate: '2026-07-15',
            damageDescription: 'Heavy rainfall destroyed 3 acres of paddy.',
            requestedAmount: 150000,
            status: 'under_verification'
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const submitClaim = async () => {
    try {
      const res = await api.post('/insurance/claims', {
        ...claimForm,
        requestedAmount: Number(claimForm.requestedAmount),
        evidenceDocuments: ['photo_1.jpg', 'survey_report.pdf']
      });
      if (res.data?.success) {
        toast.success("Claim submitted successfully. AI analysis initiated.");
        setClaimModalOpen(false);
        fetchInsuranceData();
      }
    } catch (err) {
      toast.error("Failed to submit claim");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Crop Insurance</h1>
          <p className="text-muted-foreground">Manage policies, track claims, and report crop damage.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setClaimModalOpen(true)}>
          Report Damage
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Policies Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" /> Active Policies
          </h3>
          {data.policies.map(policy => (
            <Card key={policy.id} className="border-l-4 border-l-emerald-500 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      {policy.status.toUpperCase()}
                    </span>
                    <h4 className="font-bold text-lg mt-2 text-slate-800">{policy.policyType}</h4>
                    <p className="text-sm text-slate-500">{policy.provider} • {policy.policyNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-500">Coverage</p>
                    <p className="font-bold text-xl text-slate-800">₹{policy.coverageAmount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between text-sm text-slate-600">
                  <span>Premium: ₹{policy.premiumAmount.toLocaleString()}</span>
                  <span>Expires: {new Date(policy.endDate).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {data.policies.length === 0 && !loading && (
            <div className="p-8 text-center text-slate-500 border-2 border-dashed rounded-xl">
              No active policies found.
            </div>
          )}
        </div>

        {/* Claims Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" /> Recent Claims
          </h3>
          {data.claims.map(claim => (
            <Card key={claim.id} className="border-l-4 border-l-amber-500">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded capitalize flex items-center gap-1 w-fit">
                      {claim.status === 'under_verification' ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      {claim.status.replace('_', ' ')}
                    </span>
                    <h4 className="font-bold text-slate-800 mt-2">Damage Report</h4>
                    <p className="text-sm text-slate-600 line-clamp-1">{claim.damageDescription}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-500">Requested</p>
                    <p className="font-bold text-lg text-slate-800">₹{claim.requestedAmount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                  <Shield className="w-4 h-4" /> AI verification in progress. Field agent will visit soon.
                </div>
              </CardContent>
            </Card>
          ))}
          {data.claims.length === 0 && !loading && (
            <div className="p-8 text-center text-slate-500 border-2 border-dashed rounded-xl">
              No claims submitted.
            </div>
          )}
        </div>
      </div>

      {/* Claim Modal */}
      {claimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Report Crop Damage</h2>
              <p className="text-sm text-slate-500">Submit a new insurance claim with evidence.</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Policy</label>
                <select 
                  className="w-full h-10 px-3 border rounded-md"
                  value={claimForm.policyId}
                  onChange={e => setClaimForm({...claimForm, policyId: e.target.value})}
                >
                  <option value="">Select a policy...</option>
                  {data.policies.map(p => (
                    <option key={p.id} value={p.id}>{p.policyNumber} - {p.policyType}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Incident Date</label>
                  <Input type="date" value={claimForm.incidentDate} onChange={e => setClaimForm({...claimForm, incidentDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Requested Amount (₹)</label>
                  <Input type="number" value={claimForm.requestedAmount} onChange={e => setClaimForm({...claimForm, requestedAmount: e.target.value})} placeholder="e.g. 50000" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Damage Description</label>
                <textarea 
                  className="w-full h-24 p-3 border rounded-md text-sm"
                  placeholder="Describe the cause and extent of crop damage..."
                  value={claimForm.damageDescription}
                  onChange={e => setClaimForm({...claimForm, damageDescription: e.target.value})}
                />
              </div>

              <div className="p-4 border-2 border-dashed rounded-xl bg-slate-50 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors">
                <Upload className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Upload photos/videos of damage</span>
              </div>
            </div>
            <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setClaimModalOpen(false)}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={submitClaim}>Submit Claim</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
