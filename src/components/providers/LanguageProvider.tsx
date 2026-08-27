"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, dictionary } from "@/lib/dictionary";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof dictionary.UZ;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("UZ");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ustago-lang") as Language;
    if (saved && ["UZ", "RU", "EN"].includes(saved)) {
      setLanguage(saved);
    }
    setMounted(true);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("ustago-lang", lang);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t: dictionary[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Return default UZ dictionary for SSR to avoid hydration mismatch before mount
    return { language: "UZ" as Language, setLanguage: () => {}, t: dictionary.UZ };
  }
  return context;
}
