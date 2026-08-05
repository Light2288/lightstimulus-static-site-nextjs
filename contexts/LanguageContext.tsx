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
 * - ✅ First-visit language auto-detection from navigator.language (EN/IT)
 * - ✅ Auto-detected language is NEVER persisted — it re-detects each visit,
 *      so it follows the user's OS/browser language until they choose manually
 * - ✅ A manual toggle IS persisted in localStorage and always takes priority
 * - ✅ SSR-safe: renders English on the server, reconciles on the client
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
 * Detect the first-visit language from the browser.
 *
 * Reads `navigator.language` (client-side only) and returns Italian when it
 * starts with `it` (case-insensitive — covers `it`, `it-IT`, `it-CH`,
 * `it-SM`, etc.), otherwise English. Falls back to English when running
 * server-side or when `navigator.language` is unavailable/empty.
 *
 * This function is pure and side-effect free: it never writes to
 * localStorage, so it can safely run on every visit that has no stored
 * preference.
 *
 * @returns {Lang} The detected language ('it' or 'en')
 */
function detectBrowserLang(): Lang {
  if (typeof navigator === 'undefined' || !navigator.language) return 'en'
  return navigator.language.toLowerCase().startsWith('it') ? 'it' : 'en'
}

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
 * 1. Renders English on the server / initial mount (hydration-safe default)
 * 2. On mount, checks localStorage for a saved preference
 * 3. If a valid saved preference exists ('en' | 'it'), uses it and never
 *    re-detects (a stored value is treated as an explicit manual choice)
 * 4. Otherwise detects the language from navigator.language (Italian if it
 *    starts with 'it', else English) WITHOUT persisting it, so it keeps
 *    following the browser language on future visits
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
    const saved = PreferencesService.getPref('lang')
    if (saved === 'en' || saved === 'it') {
      // A stored preference is a manual choice: always honor it and never
      // re-detect or override it.
      setLang(saved)
      return
    }
    // No valid stored preference (first visit, or invalid/legacy value):
    // detect from the browser and apply it WITHOUT persisting, so the
    // displayed language keeps following the user's OS/browser language on
    // future visits until they make a manual choice.
    setLang(detectBrowserLang())
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
