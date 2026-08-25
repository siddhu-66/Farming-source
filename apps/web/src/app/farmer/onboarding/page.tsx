"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { FarmerOnboardingWizard } from '@/components/farmer/onboarding/FarmerOnboardingWizard';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function FarmerOnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    if (user.role.toUpperCase() !== 'FARMER') {
      router.push('/login');
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await api.get('/v1/profile');
        if (response.data.success) {
          const freshUser = response.data.data;
          setAuth(freshUser, useAuthStore.getState().token || '');
          
          if (!freshUser.onboardingCompleted) {
            router.push('/onboarding/profile'); // They haven't finished basic onboarding
            return;
          }

          // If they have completed the farmer onboarding specifically (we'd need to check this logic in a real app, maybe via onboarding_status table)
          // For now, assume if they are here, they need to do it. The backend handles actual redirects if already done.
          setLoading(false);
        } else {
          router.push('/login');
        }
      } catch (e) {
        console.error('Failed to verify profile status:', e);
        router.push('/login');
      }
    };

    checkStatus();
  }, [isAuthenticated, user, router, setAuth]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10">
      <FarmerOnboardingWizard />
    </div>
  );
}
