import { useState, useEffect } from 'react';
import { useUiStore } from '@/stores/uiStore';
import { DEFAULT_LANGUAGE } from '@/config/languages';

type Translations = Record<string, string>;

const cache: Record<string, Translations> = {};

export function useTranslation(namespace = 'common') {
  const { language } = useUiStore();
  const [translations, setTranslations] = useState<Translations>({});
  const [fallback, setFallback] = useState<Translations>({});

  useEffect(() => {
    async function loadTranslations() {
      // Load fallback (English)
      if (!cache[`${DEFAULT_LANGUAGE}-${namespace}`]) {
        try {
          const mod = await import(`@/locales/${DEFAULT_LANGUAGE}/${namespace}.json`);
          cache[`${DEFAULT_LANGUAGE}-${namespace}`] = mod.default || mod;
        } catch (e) {
          console.warn(`Missing fallback translation for namespace: ${namespace}`);
          cache[`${DEFAULT_LANGUAGE}-${namespace}`] = {};
        }
      }
      setFallback(cache[`${DEFAULT_LANGUAGE}-${namespace}`]);

      // Load active language
      if (language !== DEFAULT_LANGUAGE) {
        if (!cache[`${language}-${namespace}`]) {
          try {
            const mod = await import(`@/locales/${language}/${namespace}.json`);
            cache[`${language}-${namespace}`] = mod.default || mod;
          } catch (e) {
            console.warn(`Missing translation for ${language}/${namespace}`);
            cache[`${language}-${namespace}`] = {};
          }
        }
        setTranslations(cache[`${language}-${namespace}`]);
      } else {
        setTranslations(cache[`${DEFAULT_LANGUAGE}-${namespace}`]);
      }
    }

    loadTranslations();
  }, [language, namespace]);

  const t = (key: string): string => {
    // Return translation, or fallback, or the key itself gracefully.
    return translations[key] || fallback[key] || key;
  };

  return { t, language };
}
