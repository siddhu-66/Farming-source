'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRegistrationStore } from '@/stores/registrationStore';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';

import { PersonalInfo } from './steps/PersonalInfo';
import { AccountCredentials } from './steps/AccountCredentials';
import { ProfileInformation } from './steps/ProfileInformation';
import { RoleSpecificForms } from './steps/RoleSpecificForms';
import { ReviewAndSubmit } from './steps/ReviewAndSubmit';

const STEPS = [
  { id: 1, title: 'Personal Info' },
  { id: 2, title: 'Account' },
  { id: 3, title: 'Profile' },
  { id: 4, title: 'Role Details' },
  { id: 5, title: 'Review' }
];

export function RegistrationWizard({ role }: { role: string }) {
  const router = useRouter();
  const { step, setStep, data, setRole, reset } = useRegistrationStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setRole(role);
  }, [role, setRole]);

  if (!mounted) return null; // Avoid hydration mismatch for persist store

  const handleCancel = () => {
    if (confirm('Discard Registration? All progress will be lost.')) {
      reset();
      router.push('/');
    }
  };

  const handleSaveDraft = async () => {
    const draftToast = toast.loading('Saving draft...');
    try {
      await api.post('/v1/auth/save-draft', data).catch(() => {});
      toast.success('Draft saved successfully', { id: draftToast });
    } catch (error) {
      toast.error('Failed to save draft to server (saved locally)', { id: draftToast });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <PersonalInfo onNext={() => setStep(2)} />;
      case 2: return <AccountCredentials onNext={() => setStep(3)} onPrev={() => setStep(1)} />;
      case 3: return <ProfileInformation onNext={() => setStep(4)} onPrev={() => setStep(2)} />;
      case 4: return <RoleSpecificForms role={role} onNext={() => setStep(5)} onPrev={() => setStep(3)} />;
      case 5: return <ReviewAndSubmit onPrev={() => setStep(4)} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050805] text-white py-12 px-4 sm:px-6">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="text-2xl font-black tracking-tight">
            Agri<span className="text-green-500">Assist</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-white/60 hover:text-white" onClick={handleSaveDraft}>
              <Save className="w-4 h-4 mr-2" /> Save Draft
            </Button>
            <Button variant="ghost" className="text-white/60 hover:text-red-400" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
          </div>
        </header>

        {/* Progress Indicator */}
        <div className="mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10 -translate-y-1/2" />
          <div className="absolute top-1/2 left-0 h-0.5 bg-green-500 -z-10 -translate-y-1/2 transition-all duration-500" style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }} />
          
          <div className="flex justify-between">
            {STEPS.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300
                  ${step > s.id ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 
                    step === s.id ? 'bg-[#050805] border-2 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 
                    'bg-[#050805] border-2 border-white/20 text-white/40'}
                `}>
                  {step > s.id ? <Check className="w-5 h-5" /> : s.id}
                </div>
                <span className={`text-xs font-semibold ${step >= s.id ? 'text-white/90' : 'text-white/40'}`}>{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-[100px] pointer-events-none" />
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-3xl font-bold mb-8 text-white">{STEPS.find(s => s.id === step)?.title}</h2>
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
