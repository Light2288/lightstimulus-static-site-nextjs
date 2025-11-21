'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, stagger, useAnimate } from 'motion/react'
import { detectRefreshOrFirstLoad } from '../../../utils/detectRefreshOrFirstLoad'

export default function TextAnimation() {
  const [scope, animate] = useAnimate()
  const isMobileRef = useRef(false)

  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile breakpoint
  useLayoutEffect(() => {
    const mq = window.matchMedia('(max-width: 1239px)')
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
      const mq = window.matchMedia('(max-width: 1239px)')
      const mobile = mq.matches

      liRow.style.transform = mobile ? 'translate(0.8em, -1.7rem)' : 'translate(0, -1.7rem)'

      mulusRow.style.transform = mobile
        ? 'translate(0.42em, 1.7rem) scale(0.78)'
        : 'translate(-0.35em, 1.7rem) scale(0.78)'

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
        { opacity: [0, 1], y: [8, 0] },
        { duration: 0.5, delay: stagger(0.08), ease: 'easeInOut' }
      )

      /* --------------------------------
         2) Split to LIGHT / MULUS
      -------------------------------- */
      const animations = [
        animate(liRow, { y: '-1.7rem' }, { duration: 0.5, ease: 'easeOut' }),
        animate(mulusRow, { y: '1.7rem' }, { duration: 0.5, ease: 'easeOut' }),
      ]

      // Mobile scaling and horizontal correction
      // if (isMobileRef.current) {
      if (isMobileRef.current) {
        animations.push(animate(liRow, { x: '0.8em' }, { duration: 0.5, ease: 'easeOut' }))
      }
      animations.push(animate(mulusRow, { scale: 0.78 }, { duration: 0.5, ease: 'easeOut' }))

      animations.push(
        animate(
          mulusRow,
          { x: isMobileRef.current ? '0.42em' : '-0.35em' },
          { duration: 0.5, ease: 'easeOut' }
        )
      )

      await Promise.all(animations)

      /* --------------------------------
         3) LIGHT + STIMULUS expansion
      -------------------------------- */
      await Promise.all([
        animate(
          ght,
          { opacity: [0, 1], x: [-12, 0] },
          { duration: 0.5, delay: stagger(0.05), ease: 'easeOut' }
        ),
        animate(
          sti,
          { opacity: [0, 1], x: [12, 0] },
          { duration: 0.5, delay: stagger(0.05), ease: 'easeOut' }
        ),
      ])

      /* --------------------------------
         4) Color new letters orange
      -------------------------------- */
      // animate(
      //   [...ght, ...sti],
      //   { color: 'var(--color-accent-secondary)' },
      //   { duration: 0.35, ease: 'easeOut' }
      // )

      animate(
        initialLetters, // LI + MULUS
        { color: 'var(--color-accent-secondary)' },
        { duration: 0.6, ease: 'easeOut' }
      )

      animate(
        [...ght, ...sti], // expanding letters
        { color: 'currentColor' },
        { duration: 0.6, ease: 'easeOut' }
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
        { duration: 0.4, ease: 'easeOut' }
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
        { duration: 1.0, ease: 'easeOut' }
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
