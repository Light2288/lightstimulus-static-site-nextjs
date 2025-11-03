'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'lightstimulus.lang'
type Lang = 'en' | 'it'

const FlagEN = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 rounded-sm" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" fill="#012169" />
    <path fill="#FFF" d="M0 0l9 6V0h6v6l9-6h0v6l-9 6 9 6v6h0l-9-6v6h-6v-6l-9 6H0v-6l9-6-9-6z" />
    <path
      fill="#C8102E"
      d="M10 0h4v10h10v4H14v10h-4V14H0v-4h10zM0 2l7 4H5L0 3v-1zm19 4l5-3v1l-4 2h-1zM0 21l5-3h2l-7 4v-1zm24 1v-1l-5-3h2l3 2v2z"
    />
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
      className="inline-flex items-center gap-x-2 rounded px-2 py-1 text-sm font-medium hover:bg-[color:var(--color-accent-primary-light)]/6 focus:outline-2 focus:outline-[color:var(--color-accent-primary-light)] dark:hover:bg-[color:var(--color-accent-primary-dark)]/8"
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
