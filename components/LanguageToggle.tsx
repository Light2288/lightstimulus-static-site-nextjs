'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useEffect, useState } from 'react'

/**
 * LanguageToggle
 *
 * - Switches between EN ↔ IT
 * - Relies on LanguageContext (no localStorage access here)
 * - Displays flag + code (EN/IT)
 * - Hydration-safe and matches Header styling
 */
export default function LanguageToggle() {
  const { lang, switchLang } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null // avoid hydration mismatch on first render

  const toggleLang = () => {
    const next = lang === 'en' ? 'it' : 'en'
    switchLang(next)
  }

  const flag = lang === 'en' ? '🇬🇧' : '🇮🇹'

  return (
    <button
      aria-label={`Toggle language (current: ${lang.toUpperCase()})`}
      onClick={toggleLang}
      className="inline-flex items-center gap-x-2 rounded px-2 py-1 text-sm font-medium hover:bg-[color:var(--color-accent-primary-light)]/10 focus:outline-2 focus:outline-[color:var(--color-accent-primary-light)] dark:hover:bg-[color:var(--color-accent-primary-dark)]/10"
    >
      <span
        className="inline-flex h-5 w-5 items-center justify-center text-[18px] leading-none"
        aria-hidden
      >
        {flag}
      </span>
      <span className="hidden w-[18px] text-center text-xs font-medium sm:block">
        {lang.toUpperCase()}
      </span>
    </button>
  )
}
