'use client';
import React, { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    setMounted(true);
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  if (!mounted) return null;

  return (
    <div className="flex items-center space-x-1 rounded-full border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-900">
      <button
        onClick={() => setTheme('light')}
        className={`rounded-full p-1.5 ${theme === 'light' ? 'bg-white shadow-sm dark:bg-gray-800' : 'text-gray-500'}`}
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`rounded-full p-1.5 ${theme === 'dark' ? 'bg-white shadow-sm dark:bg-gray-800' : 'text-gray-500'}`}
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`rounded-full p-1.5 ${theme === 'system' ? 'bg-white shadow-sm dark:bg-gray-800' : 'text-gray-500'}`}
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  );
}
