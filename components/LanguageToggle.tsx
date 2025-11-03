'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'lightstimulus.lang'
type Lang = 'en' | 'it'

const FlagEN = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect width="24" height="24" rx="3" fill="#fff" />
    <g stroke="#012169" strokeWidth="1">
      <path d="M0 0h24v24H0z" stroke="none"></path>
    </g>
    <path d="M0 0h24v24H0z" fill="#C8102E" opacity="0.0" />
    {/* simplified icon — it's just a small EN marker; main label shows EN/IT */}
  </svg>
)

const FlagIT = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect width="24" height="24" rx="3" fill="#fff" />
    <g>
      <rect x="2" y="2" width="6" height="20" fill="#008C45" />
      <rect x="9" y="2" width="6" height="20" fill="#F4F5F0" />
      <rect x="16" y="2" width="6" height="20" fill="#CD212A" />
    </g>
  </svg>
)

export default function LanguageToggle() {
  const [lang, setLang] = useState<Lang>('en')

  useEffect(() => {
    // initialise from localStorage or browser locale
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (stored === 'it' || stored === 'en') {
      setLang(stored)
    } else {
      const navLang = (navigator.language || 'en').startsWith('it') ? 'it' : 'en'
      setLang(navLang)
      try {
        localStorage.setItem(STORAGE_KEY, navLang)
      } catch (e) {
        // ignore storage errors
      }
    }
  }, [])

  const toggle = () => {
    const next: Lang = lang === 'en' ? 'it' : 'en'
    setLang(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch (e) {
      // ignore
    }
    // Emit a custom event so any LanguageProvider (when present) can react instantly.
    // This avoids needing to wire the toggle directly to a specific provider here.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lightstimulus:lang', { detail: { lang: next } }))
    }
  }

  return (
    <button
      aria-label="Toggle language"
      onClick={toggle}
      className="inline-flex items-center gap-x-2 rounded px-2 py-1 text-sm font-medium hover:bg-[color:var(--color-accent-primary-light)]/6 focus:outline focus:outline-2 focus:outline-[color:var(--color-accent-primary-light)] dark:hover:bg-[color:var(--color-accent-primary-dark)]/8"
    >
      <span aria-hidden className="sr-only">
        Language
      </span>
      <div className="flex items-center gap-x-2">
        <div className="flex h-5 w-5 items-center justify-center">
          {lang === 'en' ? <FlagEN /> : <FlagIT />}
        </div>
        <div className="hidden text-xs font-medium sm:block">{lang.toUpperCase()}</div>
      </div>
    </button>
  )
}
