import React from 'react';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  return (
    <button className="flex items-center space-x-1 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
      <Globe className="h-4 w-4" />
      <span>EN</span>
    </button>
  );
}
