"use client";

import React, { useEffect } from 'react';
import { useDashboardStore } from '../../stores/useDashboardStore';
import { UniversalLoader } from './UniversalLoader';
import { useSocket } from '../../hooks/useSocket';

const getToken = () => {
  if (typeof window === 'undefined') return null;
  // Try local storage first
  const localToken = localStorage.getItem('token');
  if (localToken) return localToken;
  
  // Fallback to cookie
  const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
  if (match) return match[2];
  
  return null;
};

export const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isReady, initialize, error } = useDashboardStore();
  
  // Initialize Socket.IO once dashboard is ready
  useSocket();

  useEffect(() => {
    const token = getToken();
    if (token) {
      initialize(token);
    } else {
      initialize('');
    }
  }, [initialize]);

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
