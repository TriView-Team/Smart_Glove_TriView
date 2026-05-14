import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { translations, type Language } from "@/i18n/translations";

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem("app-language");
    return (stored === "ar" ? "ar" : "en") as Language;
  });

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("app-language", newLang);
  }, []);

  const t = useCallback(
    (key: string) => translations[lang]?.[key] || translations["en"]?.[key] || key,
    [lang]
  );

  const isRTL = lang === "ar";

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [isRTL, lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, isRTL }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};
