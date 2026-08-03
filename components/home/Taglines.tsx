'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { easeOut, easeIn } from 'motion'
import { useLanguage } from '@/contexts/LanguageContext'

const INTERVAL = 5000
const CHAR_DELAY = 0.04
const FADE_DURATION = 0.5 // parent fade duration

export default function Taglines() {
  const { t } = useLanguage()

  const taglines = Array.from({ length: 7 }).map((_, i) => t(`hero.taglines.${i}`))

  const [index, setIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [showText, setShowText] = useState(true)

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)

    const id = setInterval(() => {
      setShowText(false) // trigger fade out
      setTimeout(() => {
        setIndex((i) => (i + 1) % taglines.length)
        setShowText(true) // trigger fade in + typewriter
      }, FADE_DURATION * 1000)
    }, INTERVAL)

    intervalRef.current = id
    return () => clearInterval(id)
  }, [taglines.length])

  const active = taglines[index]
  // Total characters drives the wipe duration so the typewriter reveals at a
  // steady per-character pace regardless of tagline length.
  const totalChars = active.replace(/\s/g, '').length
  const typeDuration = Math.max(totalChars * CHAR_DELAY, 0.3)

  return (
    <section className="relative mt-8 flex min-h-[3.5rem] justify-center px-4">
      <AnimatePresence mode="wait">
        {showText && (
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: FADE_DURATION, ease: easeOut } }}
            exit={{ opacity: 0, transition: { duration: FADE_DURATION, ease: easeIn } }}
            className="text-center font-mono text-xl font-medium drop-shadow-[0_0_6px_rgba(0,0,0,0.15)] md:text-2xl dark:drop-shadow-[0_0_6px_rgba(255,255,255,0.15)]"
          >
            {/* A single left-to-right clip-path wipe on the gradient element
                itself (a true typewriter reveal). The clip is on the SAME
                element that carries the background-clip:text gradient, and no
                child is transformed — so Chrome has no transformed descendant
                to mis-project the clipped background onto (no "stacked glyphs"
                flash). */}
            <motion.div
              className="bg-gradient-to-r from-[var(--color-primary-400)] via-[var(--color-primary-500)] to-[var(--color-primary-300)] bg-clip-text text-transparent"
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              animate={{
                clipPath: 'inset(0 0% 0 0)',
                transition: { duration: typeDuration, ease: 'linear' },
              }}
            >
              {active}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
