"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Landmark, Calendar, IndianRupee, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function LoansDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    loans: [] as any[],
    emis: [] as any[]
  });
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedEmi, setSelectedEmi] = useState<any>(null);

  useEffect(() => {
    fetchFinancials();
  }, []);

  const fetchFinancials = async () => {
    try {
      setLoading(true);
      const [loanRes, emiRes] = await Promise.all([
        api.get('/api/v1/loans'),
        api.get('/api/v1/finances/emi')
      ]);
      
      if (loanRes.data?.success && emiRes.data?.success) {
        setData({
          loans: loanRes.data.data.loans,
          emis: emiRes.data.data.emis
        });
      }
    } catch (err) {
      // Mock data fallback
      setData({
        loans: [
          {
            id: 'ln-1',
            loanNumber: 'LN-459812',
            bankName: 'State Bank of India',
            loanType: 'Tractor Loan',
            principalAmount: 400000,
            remainingBalance: 250000,
            interestRate: 7.5,
            durationMonths: 48,
            status: 'active'
          }
        ],
        emis: [
          {
            id: 'emi-1',
            loanId: 'ln-1',
            amount: 9666.67,
            dueDate: '2026-08-05',
            status: 'pending',
            loan: { bankName: 'State Bank of India', loanType: 'Tractor Loan' }
          },
          {
            id: 'emi-2',
            loanId: 'ln-1',
            amount: 9666.67,
            dueDate: '2026-07-05',
            status: 'paid',
            paidDate: '2026-07-02',
            loan: { bankName: 'State Bank of India', loanType: 'Tractor Loan' }
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayEmi = async () => {
    try {
      const res = await api.post('/api/v1/finances/emi/pay', { emiId: selectedEmi.id });
      if (res.data?.success) {
        toast.success("EMI payment successful!");
        setPayModalOpen(false);
        fetchFinancials();
      }
    } catch (err) {
      toast.error("Payment failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Loans & EMIs</h1>
        <p className="text-muted-foreground">Manage your agricultural loans and track upcoming EMI payments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Loans */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Landmark className="w-5 h-5 text-indigo-600" /> Active Loans
          </h3>
          {data.loans.map(loan => (
            <Card key={loan.id} className="border-l-4 border-l-indigo-500 overflow-hidden relative">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg text-slate-800">{loan.loanType}</h4>
                    <p className="text-sm text-slate-500">{loan.bankName} • {loan.loanNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-500">Remaining Balance</p>
                    <p className="font-bold text-xl text-slate-800">₹{loan.remainingBalance.toLocaleString()}</p>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-6 space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-500">
                    <span>₹{loan.principalAmount - loan.remainingBalance} paid</span>
                    <span>₹{loan.principalAmount} Total</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${((loan.principalAmount - loan.remainingBalance) / loan.principalAmount) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex justify-between text-sm text-slate-600">
                  <span>Interest: {loan.interestRate}% p.a.</span>
                  <span>Tenure: {loan.durationMonths} Months</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {data.loans.length === 0 && !loading && (
            <div className="p-8 text-center text-slate-500 border-2 border-dashed rounded-xl">
              No active loans found.
            </div>
          )}
        </div>

        {/* EMI Calendar */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" /> EMI Tracker
          </h3>
          {data.emis.map(emi => (
            <Card key={emi.id} className={`border-l-4 ${emi.status === 'paid' ? 'border-l-emerald-500 opacity-75' : 'border-l-amber-500 shadow-md'}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${emi.status === 'paid' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                    <IndianRupee className={`w-6 h-6 ${emi.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">{emi.loan.bankName}</p>
                    <h4 className="font-bold text-slate-800">₹{emi.amount.toLocaleString()}</h4>
                    <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                      {emi.status === 'paid' ? (
                        <><CheckCircle className="w-3 h-3 text-emerald-500" /> Paid on {new Date(emi.paidDate).toLocaleDateString()}</>
                      ) : (
                        <><Clock className="w-3 h-3 text-amber-500" /> Due: {new Date(emi.dueDate).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                </div>
                {emi.status === 'pending' && (
                  <Button 
                    className="bg-amber-500 hover:bg-amber-600"
                    onClick={() => { setSelectedEmi(emi); setPayModalOpen(true); }}
                  >
                    Pay Now
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {payModalOpen && selectedEmi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 border-b text-center space-y-2">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <IndianRupee className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold">Pay EMI</h2>
              <p className="text-sm text-slate-500">{selectedEmi.loan.bankName} - {selectedEmi.loan.loanType}</p>
            </div>
            <div className="p-6 bg-slate-50 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">EMI Amount</span>
                <span className="font-bold text-lg text-slate-800">₹{selectedEmi.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Due Date</span>
                <span className="font-medium">{new Date(selectedEmi.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="p-6 border-t flex flex-col gap-3">
              <Button className="bg-emerald-600 hover:bg-emerald-700 h-12 w-full text-lg shadow-lg shadow-emerald-600/20" onClick={handlePayEmi}>
                Confirm Secure Payment
              </Button>
              <Button variant="ghost" onClick={() => setPayModalOpen(false)}>Cancel</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
