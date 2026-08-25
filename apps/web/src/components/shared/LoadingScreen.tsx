import React from 'react';
import { Spinner } from '../ui/Spinner';

export function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center space-y-4">
        <Spinner className="h-12 w-12" />
        <p className="text-sm text-gray-500">Loading AgriAssist...</p>
      </div>
    </div>
  );
}
