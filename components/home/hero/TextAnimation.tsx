'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, stagger, useAnimate } from 'motion/react'

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
    async function run() {
      const initialLetters = scope.current.querySelectorAll('.initial-letter')
      const liRow = scope.current.querySelector('.li-row')
      const mulusRow = scope.current.querySelector('.mulus-row')

      const ght = scope.current.querySelectorAll('.ght-letter')
      const sti = scope.current.querySelectorAll('.sti-letter')

      const glowTarget = scope.current.querySelector('.text-glow-target')

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
      animations.push(animate(mulusRow, { scale: 0.78 }, { duration: 0.5, ease: 'easeOut' }))

      animations.push(animate(mulusRow, { x: '-0.35em' }, { duration: 0.5, ease: 'easeOut' }))
      // }

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
        { duration: 0.35, ease: 'easeOut' }
      )

      animate(
        [...ght, ...sti], // expanding letters
        { color: 'white' },
        { duration: 0.35, ease: 'easeOut' }
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
      className="relative inline-block text-5xl leading-none font-semibold select-none md:text-6xl"
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
        <div className="li-row flex space-x-1">
          <motion.span className="initial-letter opacity-0">L</motion.span>
          <motion.span className="initial-letter opacity-0">I</motion.span>
          <motion.span className="ght-letter opacity-0">G</motion.span>
          <motion.span className="ght-letter opacity-0">H</motion.span>
          <motion.span className="ght-letter opacity-0">T</motion.span>
        </div>

        {/* ROW 2 — STIMULUS */}
        <div className="mulus-row absolute flex space-x-1" style={{ right: '-0.65em', top: 0 }}>
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
