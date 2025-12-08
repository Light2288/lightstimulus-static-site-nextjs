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
  const words = active.split(' ').map((word) => word.split(''))

  return (
    <section className="relative mt-6 flex min-h-[3.5rem] justify-center px-4">
      <AnimatePresence mode="wait">
        {showText && (
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: FADE_DURATION, ease: easeOut } }}
            exit={{ opacity: 0, transition: { duration: FADE_DURATION, ease: easeIn } }}
            className="bg-gradient-to-r from-[var(--color-primary-400)] via-[var(--color-primary-500)] to-[var(--color-primary-300)] bg-clip-text text-center font-mono text-xl font-medium text-transparent drop-shadow-[0_0_6px_rgba(0,0,0,0.15)] md:text-2xl dark:drop-shadow-[0_0_6px_rgba(255,255,255,0.15)]"
          >
            <div className="flex flex-wrap justify-center gap-x-2">
              {(() => {
                let cumulativeChars = 0
                return words.map((chars, wordIndex) => (
                  <span key={wordIndex} className="inline-block">
                    {chars.map((char, charIndex) => {
                      const delay = (cumulativeChars + charIndex) * CHAR_DELAY
                      return (
                        <motion.span
                          key={charIndex}
                          initial={{ opacity: 0, y: '0.4em' }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            transition: { delay, duration: 0.3, ease: easeOut },
                          }}
                          className="inline-block"
                        >
                          {char}
                        </motion.span>
                      )
                    })}
                    {(() => {
                      cumulativeChars += chars.length
                      return null
                    })()}
                  </span>
                ))
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
