import { createContext, useContext, useState, ReactNode } from 'react';
import { en, Translations } from './en';
import { de } from './de';
import { fr } from './fr';
import { es } from './es';
import { tr } from './tr';

export type Language = 'en' | 'de' | 'fr' | 'es' | 'tr';

export const LANGUAGE_OPTIONS: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch',  flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español',  flag: '🇪🇸' },
  { code: 'tr', label: 'Türkçe',   flag: '🇹🇷' },
];

const translations: Record<Language, Translations> = { en, de, fr, es, tr };

interface I18nCtx { t: Translations; lang: Language; setLang: (l: Language) => void; }
const I18nContext = createContext<I18nCtx>({ t: en, lang: 'en', setLang: () => {} });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => (localStorage.getItem('sb_lang') as Language) || 'en');

  function setLang(l: Language) {
    setLangState(l);
    localStorage.setItem('sb_lang', l);
  }

  return <I18nContext.Provider value={{ t: translations[lang], lang, setLang }}>{children}</I18nContext.Provider>;
}

export const useTranslation = () => useContext(I18nContext);
