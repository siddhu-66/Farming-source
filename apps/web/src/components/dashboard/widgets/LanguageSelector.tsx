"use client";

import { useUiStore } from "@/stores/uiStore";
import { Languages, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'te', name: 'Telugu' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'kn', name: 'Kannada' },
  { code: 'mr', name: 'Marathi' },
  { code: 'bn', name: 'Bengali' },
];

export function LanguageSelector() {
  const { language, setLanguage } = useUiStore();

  return (
    <Dropdown 
      trigger={
        <Button variant="ghost" size="icon" title="Change Language" className="hidden sm:flex">
          <Languages className="h-5 w-5" />
        </Button>
      }
    >
      <div className="w-48 p-1">
        <div className="px-2 py-1.5 mb-1 border-b border-gray-100 dark:border-gray-800">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Language</p>
        </div>
        
        <div className="max-h-64 overflow-y-auto space-y-0.5">
          {LANGUAGES.map(lang => (
            <button 
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className="w-full flex items-center justify-between px-2 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className={language === lang.code ? "font-medium" : ""}>{lang.name}</span>
              {language === lang.code && <Check className="h-4 w-4 text-green-600 dark:text-green-500" />}
            </button>
          ))}
        </div>
      </div>
    </Dropdown>
  );
}
