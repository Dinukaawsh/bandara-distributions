'use client';

import { createContext, useContext, useMemo } from 'react';
import type { Lang } from '@/lib/translations';

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (si: string, en: string) => string;
};

const LangContext = createContext<LangContextValue | null>(null);

type LangProviderProps = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  children: React.ReactNode;
};

export function LangProvider({ lang, setLang, children }: LangProviderProps) {
  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: (si: string, en: string) => (lang === 'si' ? si : en),
    }),
    [lang, setLang]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) {
    return {
      lang: 'si' as Lang,
      setLang: () => {},
      t: (si: string, en: string) => si,
    };
  }
  return ctx;
}

export function roleOptions(lang: Lang) {
  return [
    { value: 'Cashier', label: lang === 'si' ? 'කැෂියර්' : 'Cashier' },
    { value: 'Admin', label: lang === 'si' ? 'පරිපාලක' : 'Admin' },
  ];
}

export function counterOptions(lang: Lang) {
  return [
    { value: 'Admin Office', label: lang === 'si' ? 'පරිපාලක කාර්යාලය' : 'Admin Office' },
    ...Array.from({ length: 15 }, (_, i) => ({
      value: `Counter ${i + 1}`,
      label: lang === 'si' ? `කවුන්ටරය ${i + 1}` : `Counter ${i + 1}`,
    })),
  ];
}
