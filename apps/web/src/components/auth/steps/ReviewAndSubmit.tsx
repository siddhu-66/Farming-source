'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegistrationStore } from '@/stores/registrationStore';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export function ReviewAndSubmit({ onPrev }: { onPrev: () => void }) {
  const router = useRouter();
  const { data, reset } = useRegistrationStore();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    const toastId = toast.loading('Submitting Registration...');

    try {
      const { data: result } = await api.post('/v1/auth/register', data);

      toast.success('Registration successful! Please verify your OTP.');
      // Clear draft
      reset();
      router.push(`/verify-otp?email=${data.personalInfo.email}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Network error during registration', { id: toastId });
      setSubmitting(false);
    }
  };

  const Section = ({ title, content }: { title: string, content: Record<string, any> }) => (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-white mb-3 pb-2 border-b border-white/10">{title}</h3>
      <div className="grid grid-cols-2 gap-y-4 gap-x-6">
        {Object.entries(content).map(([key, value]) => {
          if (!value || key === 'password') return null; // Don't show empty fields or passwords
          
          // Format camelCase key to Title Case
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          
          return (
            <div key={key}>
              <div className="text-xs text-white/40 uppercase tracking-wider mb-1">{label}</div>
              <div className="text-sm text-white/90 font-medium">
                {key === 'profilePhoto' ? 'Uploaded' : String(value)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-black/20 rounded-2xl p-6 border border-white/5 max-h-[50vh] overflow-y-auto">
        <Section title="Personal Information" content={data.personalInfo} />
        <Section title="Account Credentials" content={{ username: data.account.username, password: '***' }} />
        <Section title="Profile Information" content={data.profile} />
        <Section title="Role-Specific Details" content={data.roleInformation} />
      </div>

      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm flex gap-3">
        <div className="text-xl">⚠️</div>
        <p>Please verify all details carefully. Once submitted, an OTP will be sent to your mobile number and email for verification.</p>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev} disabled={submitting} className="border-white/10 text-white hover:bg-white/5">
          Edit Details
        </Button>
        <Button onClick={handleSubmit} disabled={submitting} className="bg-green-500 hover:bg-green-600 text-white px-8 font-bold">
          {submitting ? 'Submitting...' : 'Submit & Verify OTP'}
        </Button>
      </div>
    </div>
  );
}
