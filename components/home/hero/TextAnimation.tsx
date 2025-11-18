'use client'

import { useEffect } from 'react'
import { motion, stagger, useAnimate } from 'motion/react'

export default function TextAnimation() {
  const [scope, animate] = useAnimate()

  useEffect(() => {
    async function run() {
      const initialLetters = scope.current.querySelectorAll('.initial-letter')
      const liRow = scope.current.querySelector('.li-row')
      const mulusRow = scope.current.querySelector('.mulus-row')
      const ght = scope.current.querySelectorAll('.ght-letter')
      const sti = scope.current.querySelectorAll('.sti-letter')

      /* 1) Fade-in original LIMULUS lettering */
      await animate(
        initialLetters,
        { opacity: [0, 1], y: [8, 0] },
        { duration: 0.5, delay: stagger(0.08), ease: 'easeInOut' }
      )

      /* 2) Vertical split (same x) */
      await Promise.all([
        animate(liRow, { y: '-1.7rem' }, { duration: 0.45, ease: 'easeOut' }),
        animate(mulusRow, { y: '1.7rem' }, { duration: 0.45, ease: 'easeOut' }),
      ])

      /* 3) (optional) Slight left shift AFTER split if needed
         animate(mulusRow, { x: "-0.75em" }, { duration: 0.001 })
      */

      /* 4) LIGHT + STIMULUS expansions simultaneously */
      await Promise.all([
        animate(
          ght,
          { opacity: [0, 1], x: [-12, 0] },
          { duration: 0.4, delay: stagger(0.05), ease: 'easeOut' }
        ),
        animate(
          sti,
          { opacity: [0, 1], x: [12, 0] },
          { duration: 0.4, delay: stagger(0.05), ease: 'easeOut' }
        ),
      ])
    }

    run()
  }, [animate, scope])

  return (
    <div
      ref={scope}
      className="relative inline-block text-5xl leading-none font-semibold select-none md:text-6xl"
      style={{ height: '3.5rem' }} // ensure both rows have room during split
    >
      {/* SIZER: must match typography so wrapper gets correct width */}
      <div className="pointer-events-none text-5xl leading-none font-semibold whitespace-nowrap opacity-0 md:text-6xl">
        LIGHT
        <br />
        STIMULUS
      </div>

      {/* Animated layers placed absolutely on top of the sizer */}
      <div className="absolute inset-0 flex items-start justify-center">
        {/* ROW 1 — LI → LIGHT */}
        <div className="li-row flex space-x-1">
          <motion.span className="initial-letter opacity-0">L</motion.span>
          <motion.span className="initial-letter opacity-0">I</motion.span>

          <motion.span className="ght-letter opacity-0">G</motion.span>
          <motion.span className="ght-letter opacity-0">H</motion.span>
          <motion.span className="ght-letter opacity-0">T</motion.span>
        </div>

        {/* ROW 2 — MULUS → STIMULUS */}
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
