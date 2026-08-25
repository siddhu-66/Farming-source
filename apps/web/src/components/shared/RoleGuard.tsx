import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/stores/notificationStore';
import { LoadingScreen } from './LoadingScreen';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { isAuthenticated, role, user } = useAuth();
  const router = useRouter();
  const { subscribe, unsubscribe } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (role && !allowedRoles.some(r => r.toLowerCase() === role.toLowerCase())) {
      router.push('/unauthorized');
    }
  }, [isAuthenticated, role, allowedRoles, router]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      subscribe(user.id);
    }
    return () => unsubscribe();
  }, [isAuthenticated, user?.id, subscribe, unsubscribe]);

  if (!isAuthenticated || !role || !allowedRoles.some(r => r.toLowerCase() === role.toLowerCase())) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
