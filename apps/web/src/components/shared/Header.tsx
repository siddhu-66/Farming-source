import React from 'react';
import { Bell, Search, Menu, Globe } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '../ui/Avatar';
import { NotificationPanel } from './NotificationPanel';
import { useUiStore } from '@/stores/uiStore';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Dropdown } from '../ui/Dropdown';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const { user, logout } = useAuth();
  const [language, setLanguage] = useState('English');
  const languages = ['English', 'Hindi', 'Gujarati', 'Telugu', 'Marathi', 'Tamil'];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="mr-4 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-64 rounded-full border border-gray-300 bg-gray-50 pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Dropdown trigger={
          <button className="flex items-center space-x-1 p-2 text-gray-500 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
            <Globe className="h-5 w-5" />
            <span className="hidden md:inline text-sm font-medium">{language.substring(0,2)}</span>
          </button>
        }>
          <div className="w-32 py-1">
            {languages.map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${language === lang ? 'font-bold text-primary' : ''}`}
              >
                {lang}
              </button>
            ))}
          </div>
        </Dropdown>
        <ThemeSwitcher />
        <Dropdown trigger={
          <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full dark:text-gray-400 dark:hover:bg-gray-800">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
          </button>
        }>
          <NotificationPanel />
        </Dropdown>
        <Dropdown trigger={
          <button className="flex items-center space-x-2">
            <Avatar src={user?.avatar} fallback={user?.name?.[0]} />
          </button>
        }>
          <div className="px-4 py-2">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <hr className="my-1 border-gray-200 dark:border-gray-700" />
          <button
            onClick={logout}
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Sign out
          </button>
        </Dropdown>
      </div>
    </header>
  );
}
