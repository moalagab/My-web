import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { Language, isRTL } from '@/lib/i18n';
import type { SystemDictionary } from '@/lib/dictionary';

interface LanguageContextType {
  lang: Language;
  dictionary: SystemDictionary;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{
  children: ReactNode;
  initialLang?: Language;
  dictionary: SystemDictionary;
}> = ({ children, initialLang = 'en', dictionary }) => {
  const lang = initialLang;

  useEffect(() => {
    document.documentElement.dir = isRTL(lang) ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const value = {
    lang,
    dictionary,
    isRtl: isRTL(lang),
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
