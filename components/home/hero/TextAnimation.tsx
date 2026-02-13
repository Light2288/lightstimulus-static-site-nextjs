'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, stagger, useAnimate } from 'motion/react'
import { detectRefreshOrFirstLoad } from '../../../utils/detectRefreshOrFirstLoad'

// Animation timing constants (in seconds)
const FADE_IN_DURATION = 0.5
const FADE_IN_STAGGER = 0.08
const SPLIT_DURATION = 0.5
const EXPANSION_DURATION = 0.5
const EXPANSION_STAGGER = 0.05
const COLOR_CHANGE_DURATION = 0.6
const GLOW_FADE_IN_DURATION = 0.4
const GLOW_FADE_OUT_DURATION = 1.0

// Layout constants
const MOBILE_BREAKPOINT = 1239 // pixels
const VERTICAL_OFFSET = 1.7 // rem
const SCALE_FACTOR = 0.78
const MOBILE_LI_OFFSET = 0.8 // em
const DESKTOP_LI_OFFSET = 0 // em
const MOBILE_MULUS_OFFSET = 0.42 // em
const DESKTOP_MULUS_OFFSET = -0.35 // em
const INITIAL_LETTER_Y_OFFSET = 8 // pixels
const EXPANSION_X_OFFSET = 12 // pixels

export default function TextAnimation() {
  const [scope, animate] = useAnimate()
  const isMobileRef = useRef(false)

  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile breakpoint
  useLayoutEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)
    const onChange = () => setIsMobile(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    isMobileRef.current = isMobile
  }, [isMobile])

  useEffect(() => {
    const root = scope.current
    const initialLetters = root.querySelectorAll('.initial-letter')
    const ght = root.querySelectorAll('.ght-letter')
    const sti = root.querySelectorAll('.sti-letter')
    const liRow = root.querySelector('.li-row')
    const mulusRow = root.querySelector('.mulus-row')
    const glowTarget = root.querySelector('.text-glow-target')

    /* ------------------------------------------------------------
       CASE 1 — ALREADY ANIMATED → Apply final state immediately
    ------------------------------------------------------------ */
    const shouldAnimate = detectRefreshOrFirstLoad('text_mount_ts')

    if (!shouldAnimate) {
      // Letters visible
      initialLetters.forEach((el) => (el.style.opacity = '1'))
      ght.forEach((el) => (el.style.opacity = '1'))
      sti.forEach((el) => (el.style.opacity = '1'))

      // Final positions
      const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)
      const mobile = mq.matches

      liRow.style.transform = mobile
        ? `translate(${MOBILE_LI_OFFSET}em, -${VERTICAL_OFFSET}rem)`
        : `translate(${DESKTOP_LI_OFFSET}em, -${VERTICAL_OFFSET}rem)`

      mulusRow.style.transform = mobile
        ? `translate(${MOBILE_MULUS_OFFSET}em, ${VERTICAL_OFFSET}rem) scale(${SCALE_FACTOR})`
        : `translate(${DESKTOP_MULUS_OFFSET}em, ${VERTICAL_OFFSET}rem) scale(${SCALE_FACTOR})`

      // Colors
      initialLetters.forEach((el) => (el.style.color = 'var(--color-accent-secondary)'))
      ;[...ght, ...sti].forEach((el) => (el.style.color = 'currentColor'))

      // Soft glow
      glowTarget.style.filter = 'drop-shadow(0 0 6px var(--color-accent-secondary))'

      return
    }

    async function run() {
      /* --------------------------------
         1) Fade-in LIMULUS letters
      -------------------------------- */
      await animate(
        initialLetters,
        { opacity: [0, 1], y: [INITIAL_LETTER_Y_OFFSET, 0] },
        { duration: FADE_IN_DURATION, delay: stagger(FADE_IN_STAGGER), ease: 'easeInOut' }
      )

      /* --------------------------------
         2) Split to LIGHT / MULUS
      -------------------------------- */
      const animations = [
        animate(
          liRow,
          { y: `-${VERTICAL_OFFSET}rem` },
          { duration: SPLIT_DURATION, ease: 'easeOut' }
        ),
        animate(
          mulusRow,
          { y: `${VERTICAL_OFFSET}rem` },
          { duration: SPLIT_DURATION, ease: 'easeOut' }
        ),
      ]

      // Mobile scaling and horizontal correction
      if (isMobileRef.current) {
        animations.push(
          animate(
            liRow,
            { x: `${MOBILE_LI_OFFSET}em` },
            { duration: SPLIT_DURATION, ease: 'easeOut' }
          )
        )
      }
      animations.push(
        animate(mulusRow, { scale: SCALE_FACTOR }, { duration: SPLIT_DURATION, ease: 'easeOut' })
      )

      animations.push(
        animate(
          mulusRow,
          { x: isMobileRef.current ? `${MOBILE_MULUS_OFFSET}em` : `${DESKTOP_MULUS_OFFSET}em` },
          { duration: SPLIT_DURATION, ease: 'easeOut' }
        )
      )

      await Promise.all(animations)

      /* --------------------------------
         3) LIGHT + STIMULUS expansion
      -------------------------------- */
      await Promise.all([
        animate(
          ght,
          { opacity: [0, 1], x: [-EXPANSION_X_OFFSET, 0] },
          { duration: EXPANSION_DURATION, delay: stagger(EXPANSION_STAGGER), ease: 'easeOut' }
        ),
        animate(
          sti,
          { opacity: [0, 1], x: [EXPANSION_X_OFFSET, 0] },
          { duration: EXPANSION_DURATION, delay: stagger(EXPANSION_STAGGER), ease: 'easeOut' }
        ),
      ])

      /* --------------------------------
         4) Color change
      -------------------------------- */
      animate(
        initialLetters, // LI + MULUS
        { color: 'var(--color-accent-secondary)' },
        { duration: COLOR_CHANGE_DURATION, ease: 'easeOut' }
      )

      animate(
        [...ght, ...sti], // expanding letters
        { color: 'currentColor' },
        { duration: COLOR_CHANGE_DURATION, ease: 'easeOut' }
      )

      /* --------------------------------
         5) Final GLOW pulse (matches logo)
      -------------------------------- */

      // Bright strong glow
      await animate(
        glowTarget,
        {
          filter: [
            'drop-shadow(0 0 0px var(--color-accent-secondary))',
            'drop-shadow(0 0 24px var(--color-accent-secondary))',
          ],
        },
        { duration: GLOW_FADE_IN_DURATION, ease: 'easeOut' }
      )

      // Fade to soft glow
      await animate(
        glowTarget,
        {
          filter: [
            'drop-shadow(0 0 24px var(--color-accent-secondary))',
            'drop-shadow(0 0 6px var(--color-accent-secondary))',
          ],
        },
        { duration: GLOW_FADE_OUT_DURATION, ease: 'easeOut' }
      )
    }

    run()
  }, [animate, scope])

  return (
    <div
      ref={scope}
      className="relative inline-block text-5xl leading-none font-semibold text-[var(--color-text-light)] select-none md:text-6xl dark:text-[var(--color-text-dark)]"
      style={{ height: '3.5rem' }}
    >
      {/* Invisible width stabilizer */}
      <div className="pointer-events-none text-5xl leading-none font-semibold whitespace-nowrap opacity-0 md:text-6xl">
        LIGHT
        <br />
        STIMULUS
      </div>

      {/* Animated content */}
      <div className="text-glow-target absolute inset-0 flex items-start justify-center">
        {/* ROW 1 — LIGHT */}
        <div
          className="li-row absolute flex space-x-1"
          style={{ right: isMobile ? '1.6em' : '0.80em', top: 0 }}
        >
          <motion.span className="initial-letter opacity-0">L</motion.span>
          <motion.span className="initial-letter opacity-0">I</motion.span>
          <motion.span className="ght-letter opacity-0">G</motion.span>
          <motion.span className="ght-letter opacity-0">H</motion.span>
          <motion.span className="ght-letter opacity-0">T</motion.span>
        </div>

        {/* ROW 2 — STIMULUS */}
        <div
          className="mulus-row absolute flex space-x-1"
          style={{ right: isMobile ? '0.1em' : '-0.65em', top: 0 }}
        >
          <motion.span className="sti-letter opacity-0">S</motion.span>
          <motion.span className="sti-letter opacity-0">T</motion.span>
          <motion.span className="sti-letter opacity-0">I</motion.span>

          <motion.span className="initial-letter opacity-0">M</motion.span>
          <motion.span className="initial-letter opacity-0">U</motion.span>
          <motion.span className="initial-letter opacity-0">L</motion.span>
          <motion.span className="initial-letter opacity-0">U</motion.span>
          <motion.span className="initial-letter opacity-0">S</motion.span>
        </div>
      </div>
    </div>
  )
}
