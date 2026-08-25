'use client';

import React, { useState, useMemo } from 'react';
import { useUiStore } from '@/stores/uiStore';
import { LANGUAGES, Language } from '@/config/languages';
import { Globe, Check, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';

export function LanguageSelector() {
  const { language, setLanguage } = useUiStore();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentLanguage = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const filteredLanguages = useMemo(() => {
    return LANGUAGES.filter((lang) => 
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSelect = (code: string) => {
    setLanguage(code);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          role="combobox" 
          aria-expanded={open} 
          className="flex items-center space-x-2 px-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Select Language"
        >
          <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="hidden sm:inline-block font-medium text-sm">
            {currentLanguage.name}
          </span>
          <span className="text-xs text-gray-400">▾</span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="z-50 w-[240px] rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-800 dark:bg-gray-900 mt-2" 
        align="end"
      >
        <div className="flex items-center border-b border-gray-100 dark:border-gray-800 pb-2 mb-2">
          <Search className="mr-2 h-4 w-4 text-gray-400 shrink-0" />
          <input 
            className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Search language..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="max-h-[300px] overflow-y-auto pr-1 space-y-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
          {filteredLanguages.length === 0 ? (
            <p className="p-2 text-center text-sm text-gray-500">No language found.</p>
          ) : (
            filteredLanguages.map((lang: Language) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-sm transition-colors hover:bg-green-50 hover:text-green-900 dark:hover:bg-green-900/30 dark:hover:text-green-300 ${
                  language === lang.code 
                    ? 'bg-green-50 text-green-700 font-semibold dark:bg-green-900/40 dark:text-green-400' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex flex-col items-start">
                  <span>{lang.nativeName}</span>
                  <span className="text-xs opacity-70">{lang.name}</span>
                </div>
                {language === lang.code && <Check className="h-4 w-4" />}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
