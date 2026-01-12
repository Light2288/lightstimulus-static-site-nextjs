'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { PreferencesService } from '@/lib/preferences/PreferencesService'
import en from '@/locales/en.json'
import it from '@/locales/it.json'

type Lang = 'en' | 'it'

interface LanguageContextType {
  lang: Lang
  t: (key: string, vars?: Record<string, string | number>) => string
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

  const t = (key: string, vars?: Record<string, string | number>): string => {
    const parts = key.split('.')
    let value: string | Record<string, unknown> = translations[lang]

    for (const part of parts) {
      if (typeof value === 'object' && value !== null && part in value) {
        value = value[part] as string | Record<string, unknown>
      } else {
        return key
      }
    }

    if (typeof value !== 'string') return key

    if (!vars) return value

    return value.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : ''))
  }

  return (
    <LanguageContext.Provider value={{ lang, t, switchLang }}>{children}</LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
