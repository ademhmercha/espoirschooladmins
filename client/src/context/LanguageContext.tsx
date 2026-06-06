import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, TranslationKey } from '../data/translations';

type Lang = 'fr' | 'ar';

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({} as LanguageContextType);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'fr');

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => setLang((l) => (l === 'fr' ? 'ar' : 'fr'));

  const t = (key: TranslationKey): string => {
    const dict = translations[lang] as Record<string, string>;
    return dict[key] ?? (translations.fr as Record<string, string>)[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t, isRTL: lang === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
