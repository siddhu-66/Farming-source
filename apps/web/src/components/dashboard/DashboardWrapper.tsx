"use client";

import React, { useEffect } from 'react';
import { useDashboardStore } from '../../stores/useDashboardStore';
import { UniversalLoader } from './UniversalLoader';
import { useSocket } from '../../hooks/useSocket';
import { useAuthStore } from '../../stores/authStore';

export const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isReady, initialize, error } = useDashboardStore();
  const token = useAuthStore((state) => state.token);

  useSocket();

  useEffect(() => {
    if (token) {
      initialize(token);
    } else {
      initialize('');
    }
  }, [initialize, token]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Initialization Error</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return <UniversalLoader />;
  }

  return <>{children}</>;
};
