"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Locale = "fr" | "en";
type I18nString = { fr: string; en: string };

type Ctx = { lang: Locale; setLang: (l: Locale) => void; toggle: () => void };
const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Locale>("fr");

  useEffect(() => {
    // Read persisted language once on mount. Done in an effect (not a lazy
    // initializer) so the server-rendered HTML stays consistent and we avoid a
    // hydration mismatch; the rule flags this legitimate external-store sync.
    const saved = window.localStorage.getItem("lang") as Locale | null;
    if (saved === "fr" || saved === "en") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLangState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLang = useCallback((l: Locale) => {
    setLangState(l);
    window.localStorage.setItem("lang", l);
    document.documentElement.lang = l;
  }, []);

  const toggle = useCallback(
    () => setLang(lang === "fr" ? "en" : "fr"),
    [lang, setLang],
  );

  const value = useMemo(
    () => ({ lang, setLang, toggle }),
    [lang, setLang, toggle],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}

export function useT() {
  const { lang } = useLang();
  return useCallback((entry: I18nString) => entry[lang], [lang]);
}
