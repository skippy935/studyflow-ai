import { useState, useEffect, useCallback } from 'react';
import { getLang, setLang, t, type Lang } from '../lib/i18n';

export function useLang() {
  const [lang, setLangState] = useState<Lang>(getLang);

  useEffect(() => {
    function onLangChange() { setLangState(getLang()); }
    window.addEventListener('langchange', onLangChange);
    return () => window.removeEventListener('langchange', onLangChange);
  }, []);

  const changeLang = useCallback((l: Lang) => {
    setLang(l);
    setLangState(l);
  }, []);

  const translate = useCallback((key: string) => t(key, lang), [lang]);

  return { lang, changeLang, t: translate };
}
