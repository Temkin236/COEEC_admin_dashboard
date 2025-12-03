import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import type { LanguageKey } from "@/utils/translations"

export interface LanguageContextValue {
  language: LanguageKey
  setLanguage: (lang: LanguageKey) => void
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<LanguageKey>("en")

  useEffect(() => {
    const stored = localStorage.getItem("language") as LanguageKey | null
    if (stored === "en" || stored === "am" || stored === "af") {
      setLanguageState(stored)
    }
  }, [])

  const setLanguage = (lang: LanguageKey) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
  }

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
}

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return ctx
}
