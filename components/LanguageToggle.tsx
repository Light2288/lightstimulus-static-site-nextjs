'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'lightstimulus.lang'
type Lang = 'en' | 'it'

export default function LanguageToggle() {
  const [lang, setLang] = useState<Lang>('en')

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (stored === 'it' || stored === 'en') {
      setLang(stored)
    } else {
      const navLang = (navigator.language || 'en').startsWith('it') ? 'it' : 'en'
      setLang(navLang)
      try {
        localStorage.setItem(STORAGE_KEY, navLang)
      } catch {
        /* ignore */
      }
    }
  }, [])

  const toggle = () => {
    const next: Lang = lang === 'en' ? 'it' : 'en'
    setLang(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lightstimulus:lang', { detail: { lang: next } }))
    }
  }

  const flag = lang === 'en' ? '🇬🇧' : '🇮🇹'

  return (
    <button
      aria-label="Toggle language"
      onClick={toggle}
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
