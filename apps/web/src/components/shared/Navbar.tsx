'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LanguageSelector } from './LanguageSelector';
import { Button } from '../ui/Button';

import { useTranslation } from '@/hooks/useTranslation';

export function Navbar() {
  const { isAuthenticated, role } = useAuth();
  const { t } = useTranslation();

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-2xl font-bold text-transparent">
            AgriAssist
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <LanguageSelector />
          <ThemeSwitcher />
          {isAuthenticated ? (
            <Link href={`/${role?.toLowerCase()}/dashboard`}>
              <Button variant="primary">{t('nav.dashboard')}</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">{t('nav.signIn')}</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary">{t('nav.getStarted')}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
