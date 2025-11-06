'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { PreferencesService } from '@/lib/preferences/PreferencesService'
import en from '@/locales/en.json'
import it from '@/locales/it.json'

type Lang = 'en' | 'it'

interface LanguageContextType {
  lang: Lang
  t: (key: string) => string
  switchLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  t: (key) => key,
  switchLang: () => {},
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const translations = { en, it }

  useEffect(() => {
    const saved = PreferencesService.getPref('lang') as Lang | null
    if (saved) {
      setLang(saved)
    } else {
      const browserLang = navigator.language.startsWith('it') ? 'it' : 'en'
      setLang(browserLang)
      PreferencesService.setPref('lang', browserLang)
    }
  }, [])

  const switchLang = (newLang: Lang) => {
    setLang(newLang)
    PreferencesService.setPref('lang', newLang)
  }

  const t = (key: string): string => {
    const parts = key.split('.')
    let value: string | Record<string, unknown> = translations[lang]

    for (const part of parts) {
      if (typeof value === 'object' && value !== null && part in value) {
        value = value[part] as string | Record<string, unknown>
      } else {
        return key
      }
    }

    return typeof value === 'string' ? value : key
  }

  return (
    <LanguageContext.Provider value={{ lang, t, switchLang }}>{children}</LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
