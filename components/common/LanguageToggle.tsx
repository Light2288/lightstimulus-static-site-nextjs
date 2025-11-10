'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

/**
 * LanguageToggle
 *
 * - Switches between EN ↔ IT
 * - Adds subtle flip animation via Motion.dev
 * - Hydration-safe
 * - Style consistent with ThemeToggle
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
  const label = lang.toUpperCase()

  return (
    <button
      aria-label={`Toggle language (current: ${label})`}
      onClick={toggleLang}
      className="relative inline-flex items-center gap-x-2 rounded px-2 py-1 text-sm font-medium hover:bg-[color:var(--color-accent-primary-light)]/10 focus:outline-2 focus:outline-[color:var(--color-accent-primary-light)] dark:hover:bg-[color:var(--color-accent-primary-dark)]/10"
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={lang}
          initial={{ opacity: 0, rotateX: 90 }}
          animate={{ opacity: 1, rotateX: 0 }}
          exit={{ opacity: 0, rotateX: -90 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="inline-flex h-5 w-5 items-center justify-center text-[18px] leading-none"
          aria-hidden
        >
          {flag}
        </motion.span>
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        <motion.span
          key={`text-${lang}`}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="hidden w-[18px] text-center text-xs font-medium sm:block"
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
