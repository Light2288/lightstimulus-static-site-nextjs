'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'motion/react'
import { PreferencesService } from '@/lib/preferences/PreferencesService'
import { Moon, Sun, Laptop2 } from 'lucide-react'

/**
 * ThemeToggle (final hybrid version)
 *
 * - Cycles through light → dark → system
 * - Tooltip shows the current theme name on hover (desktop)
 * - Uses Motion.dev animations
 * - Distinct "System" icon (Laptop2) for clarity
 * - Accessible via aria-label for screen readers
 */

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (theme) PreferencesService.setPref('theme', theme)
  }, [theme])

  const handleToggle = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    setTheme(next)
  }

  const Icon = () => {
    if (!mounted) return null
    if (theme === 'system') return <Laptop2 className="h-5 w-5" />
    if (resolvedTheme === 'light') return <Sun className="h-5 w-5" />
    return <Moon className="h-5 w-5" />
  }

  const label = !mounted
    ? ''
    : theme === 'system'
      ? 'System'
      : resolvedTheme === 'light'
        ? 'Light'
        : 'Dark'

  return (
    <div className="group relative flex items-center">
      <button
        aria-label={`Toggle theme (current: ${label})`}
        onClick={handleToggle}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-transparent text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`${resolvedTheme ?? 'system'}-${theme ?? 'system'}`}
            initial={{ opacity: 0, scale: 0.8, rotate: -60 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 60 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="flex items-center justify-center"
          >
            <Icon />
          </motion.div>
        </AnimatePresence>
      </button>

      {/* Tooltip (desktop hover only) */}
      <div className="pointer-events-none absolute top-full left-1/2 z-50 mt-2 -translate-x-1/2 transform rounded-md bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100 dark:bg-gray-200 dark:text-gray-900">
        {label}
      </div>
    </div>
  )
}
