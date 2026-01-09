import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from '@/locales';
import { safeSetItem, safeGetItem } from '@/services/localStorageService';

const LANGUAGE_STORAGE_KEY = 'betpro_language';

const defaultLanguage = (() => {
  // Server-side or non-browser environment: default to French
  if (typeof window === 'undefined') return 'fr';

  // Respect previously chosen language if stored
  const stored = safeGetItem(LANGUAGE_STORAGE_KEY);
  if (stored === 'ar' || stored === 'fr') return stored;

  // Default for new users/sessions is French
  return 'fr';
})();

const I18nContext = createContext({
  language: 'ar',
  setLanguage: () => { },
  isRtl: true,
  t: (key) => key,
});

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(defaultLanguage);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const success = safeSetItem(LANGUAGE_STORAGE_KEY, language);
    if (!success) {
      console.warn('Failed to save language preference due to storage limits');
    }
  }, [language]);

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang === 'fr' ? 'fr' : 'ar');
  }, []);

  const isRtl = language === 'ar';

  const t = useMemo(() => {
    const dict = translations[language] || {};
    return (key) => {
      if (!key) return '';
      if (dict[key]) return dict[key];
      const fallbackDict = translations.ar || {};
      if (fallbackDict[key]) return fallbackDict[key];
      return key;
    };
  }, [language]);

  const value = useMemo(
    () => ({ language, setLanguage, isRtl, t }),
    [language, setLanguage, isRtl, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export { I18nContext };
