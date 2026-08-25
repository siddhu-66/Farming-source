"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { ProfileWizard } from '@/components/onboarding/ProfileWizard';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function ProfileOnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic auth check
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    // Refetch latest user state to confirm onboarding status
    const checkStatus = async () => {
      try {
        const response = await api.get('/v1/profile');
        if (response.data.success) {
          const freshUser = response.data.data;
          
          // Update store just in case
          // assuming token doesn't change, we just need to keep it
          setAuth(freshUser, useAuthStore.getState().token || '');

          if (freshUser.onboardingCompleted) {
            router.push(`/${freshUser.role.toLowerCase()}/dashboard`);
          } else {
            setLoading(false);
          }
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
      <ProfileWizard />
    </div>
  );
}
