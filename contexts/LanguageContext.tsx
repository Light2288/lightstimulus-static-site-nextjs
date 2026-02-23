/**
 * Language Context - Client-Side Internationalization System
 *
 * This context provides a custom client-side i18n solution for the portfolio website.
 *
 * **Supported Languages:**
 * - English (en) - Default
 * - Italian (it)
 *
 * **Key Features:**
 * - ✅ Instant language switching without page reload
 * - ✅ Preference stored in localStorage (persists across sessions)
 * - ✅ Defaults to English unless user explicitly switches
 * - ✅ Does NOT use browser language detection
 * - ✅ Does NOT create language-specific URLs (/en/*, /it/*)
 * - ✅ Variable interpolation support in translations
 *
 * **Architecture Constraints:**
 * This implementation is designed to work with Next.js static export:
 * - Must remain client-side (no server-side routing)
 * - Cannot use Next.js built-in i18n (requires server)
 * - Language switching must be instant (client-side only)
 *
 * @module LanguageContext
 *
 * @example
 * // In a client component:
 * import { useLanguage } from '@/contexts/LanguageContext'
 *
 * function MyComponent() {
 *   const { t, lang, switchLang } = useLanguage()
 *
 *   return (
 *     <div>
 *       <h1>{t('home.title')}</h1>
 *       <p>{t('home.greeting', { name: 'John' })}</p>
 *       <button onClick={() => switchLang(lang === 'en' ? 'it' : 'en')}>
 *         Switch Language
 *       </button>
 *     </div>
 *   )
 * }
 */
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { PreferencesService } from '@/lib/preferences/PreferencesService'
import en from '@/locales/en.json'
import it from '@/locales/it.json'

/** Supported language codes */
type Lang = 'en' | 'it'

/**
 * Language Context value shape
 */
interface LanguageContextType {
  /** Current active language */
  lang: Lang
  /** Translation function with optional variable interpolation */
  t: (key: string, vars?: Record<string, string | number>) => string
  /** Function to switch the active language */
  switchLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  t: (key) => key,
  switchLang: () => {},
})

/**
 * Language Provider Component
 *
 * Wraps the application to provide i18n functionality.
 * Should be placed high in the component tree (typically in root layout).
 *
 * **Initialization Logic:**
 * 1. On mount, checks localStorage for saved preference
 * 2. If found, uses saved language
 * 3. If not found, defaults to English and saves it
 * 4. Does NOT use browser language detection
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 *
 * @example
 * // In app/layout.tsx:
 * import { LanguageProvider } from '@/contexts/LanguageContext'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <LanguageProvider>
 *           {children}
 *         </LanguageProvider>
 *       </body>
 *     </html>
 *   )
 * }
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const translations = { en, it }

  useEffect(() => {
    const saved = PreferencesService.getPref('lang') as Lang | null
    if (saved) {
      setLang(saved)
    } else {
      // Always default to English unless user has previously selected a language
      setLang('en')
      PreferencesService.setPref('lang', 'en')
    }
  }, [])

  /**
   * Switch the active language
   *
   * Updates both the React state and localStorage preference.
   * Change is instant (no page reload).
   *
   * @param {Lang} newLang - The language to switch to ('en' or 'it')
   */
  const switchLang = (newLang: Lang) => {
    setLang(newLang)
    PreferencesService.setPref('lang', newLang)
  }

  /**
   * Translation function with variable interpolation
   *
   * Retrieves translated strings from locale JSON files using dot notation.
   * Supports variable interpolation using {{variable}} syntax.
   *
   * **Features:**
   * - Nested key access via dot notation (e.g., 'home.hero.title')
   * - Variable interpolation (e.g., 'Hello {{name}}')
   * - Fallback to key if translation not found
   *
   * @param {string} key - Translation key in dot notation (e.g., 'nav.home')
   * @param {Record<string, string | number>} [vars] - Optional variables for interpolation
   * @returns {string} Translated string, or the key itself if translation not found
   *
   * @example
   * // Simple translation:
   * t('nav.home') // Returns "Home" or "Home" (depending on language)
   *
   * @example
   * // With nested keys:
   * t('home.hero.title') // Accesses translations.home.hero.title
   *
   * @example
   * // With variable interpolation:
   * t('greeting.hello', { name: 'John', age: 30 })
   * // If translation is "Hello {{name}}, you are {{age}} years old"
   * // Returns: "Hello John, you are 30 years old"
   */
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
