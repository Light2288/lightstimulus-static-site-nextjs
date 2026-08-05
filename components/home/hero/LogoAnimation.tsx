'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { gsap } from 'gsap'
import { DrawSVGPlugin, MotionPathPlugin } from 'gsap/all'
import { detectRefreshOrFirstLoad } from '../../../utils/detectRefreshOrFirstLoad'

gsap.registerPlugin(MotionPathPlugin, DrawSVGPlugin)

/* ---------------------------------------------------------------------------
   Timing budget (seconds)

   The logo animation is tuned to finish in the SAME window as the text
   animation (see TextAnimation.tsx). The text's awaited chain is:

     fade-in (~1.28) + split (0.68) + expansion (~0.82)  = ~2.78  (pre-glow)
     + glow-in (0.55) + glow-out (1.35)                  = final glow finale

   The logo's pre-pulse sequence therefore budgets ~2.79s (so its final pulse
   starts together with the text's glow), stage 2 (upper body) is kept snappy,
   and the pulse fade-out is a touch longer than the text's for a soft,
   well-aligned finish.

   Pre-pulse budget (each value adds sequentially):
     stage 1: TAIL_LOWER (0.82) + ENLARGE (0.34) + BODY_FADE (0.34)  = 1.50
     stage 2: TAIL_UPPER (0.68) + ENLARGE_2 (0.27) + BODY_FADE (0.34) = 1.29
     total                                                           = 2.79
--------------------------------------------------------------------------- */

// Pre-pulse staged sequence (sums to ~2.79s to match the text pre-glow phase)
const TAIL_LOWER_DURATION = 0.82 // trace bottom → middle circle
const DOT_ENLARGE_DURATION = 0.34 // small dot grows to the target circle size
const BODY_FADE_DURATION = 0.34 // body part fades in as the dot reaches full size
const TAIL_UPPER_DURATION = 0.68 // trace middle circle → top circle (faster stage 2)
const DOT_ENLARGE_DURATION_2 = 0.27 // second enlarge (top circle) — faster

// Final pulse (fade-in matches text; fade-out a touch longer for a soft finish)
const PULSE_FADE_IN_DURATION = 0.55
const PULSE_FADE_OUT_DURATION = 1.45
const PULSE_OPACITY_PEAK = 0.6
const FINAL_GLOW_OPACITY = 0.2

// Traveling drop (small dot) dimensions
const DROPLET_R_SMALL = 10 // starting small dot radius
const CIRCLE_MIDDLE_R = 22.75 // matches #circle-middle
const CIRCLE_TOP_R = 56.7 // matches #circle-top

export default function LogoAnimation() {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (!svgRef.current) return
    const svg = svgRef.current

    // Elements
    const tailLower = svg.querySelector('#tail-lower') as SVGPathElement
    const tailUpper = svg.querySelector('#tail-upper') as SVGPathElement
    const bodyLower = svg.querySelector('#body-lower') as SVGPathElement
    const bodyUpper = svg.querySelector('#body-upper') as SVGPathElement
    const circleMiddle = svg.querySelector('#circle-middle') as SVGCircleElement
    const circleTop = svg.querySelector('#circle-top') as SVGCircleElement
    const pulseGlowGroup = svg.querySelector('#pulseGlowGroup') as SVGGElement

    const allDrawn = [tailLower, tailUpper, bodyLower, bodyUpper, circleMiddle, circleTop]

    /* =======================================================================
       CASE 1 — Animation should NOT run (internal SPA navigation OR the user
       has requested reduced motion). Snap everything to the final, fully
       visible state with resting glow.
    ======================================================================= */
    const shouldAnimate = detectRefreshOrFirstLoad('logo_mount_ts') && !shouldReduceMotion

    if (!shouldAnimate) {
      const drops = svg.querySelectorAll('ellipse')
      drops.forEach((el) => {
        el.style.opacity = '0'
        el.style.visibility = 'hidden'
      })

      gsap.set([tailLower, tailUpper], {
        opacity: 1,
        drawSVG: '0% 100%',
        filter: 'url(#glow)',
      })
      gsap.set([bodyLower, bodyUpper, circleMiddle, circleTop], {
        opacity: 1,
        filter: 'url(#glow)',
      })

      // Soft final glow
      gsap.set(pulseGlowGroup, { opacity: FINAL_GLOW_OPACITY })
      return
    }

    /* =======================================================================
       CASE 2 — FIRST LOAD / REFRESH → Run full staged animation
    ======================================================================= */

    // Create a small traveling drop (reused pattern from the original logo)
    function createDrop(radius: number) {
      const drop = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
      drop.setAttribute('rx', String(radius))
      drop.setAttribute('ry', String(radius))
      drop.setAttribute('fill', 'url(#dropGradient)')
      drop.setAttribute('filter', 'url(#glow)')
      svg.appendChild(drop)
      return drop
    }

    // Initialization: constant subtle glow on the tail; bodies/circles hidden.
    gsap.set([tailLower, tailUpper], { opacity: 1, filter: 'url(#glow)' })
    gsap.set([bodyLower, bodyUpper, circleMiddle, circleTop], {
      opacity: 0,
      filter: 'url(#glow)',
    })

    const dropLower = createDrop(DROPLET_R_SMALL)
    const dropUpper = createDrop(DROPLET_R_SMALL)
    gsap.set(dropUpper, { autoAlpha: 0 })

    // Position the first drop at the START of tail-lower (bottom of the tail).
    gsap.set(dropLower, {
      motionPath: { path: tailLower, align: tailLower, alignOrigin: [0.5, 0.5], start: 0 },
      autoAlpha: 1,
    })

    /* ===========================
        Full GSAP Timeline
    ============================ */
    const tl = gsap.timeline({ defaults: { ease: 'none' } })

    /* --- Stage 1: trace bottom → middle circle -------------------------- */
    tl.fromTo(
      tailLower,
      { drawSVG: '0% 0%' },
      { drawSVG: '0% 100%', duration: TAIL_LOWER_DURATION },
      0
    )
    tl.to(
      dropLower,
      {
        duration: TAIL_LOWER_DURATION,
        motionPath: {
          path: tailLower,
          align: tailLower,
          alignOrigin: [0.5, 0.5],
          start: 0,
          end: 1,
          autoRotate: false,
        },
      },
      0
    )

    // Dot enlarges to the middle circle size; lower body fades in when it
    // reaches full size.
    tl.to(dropLower, {
      attr: { rx: CIRCLE_MIDDLE_R, ry: CIRCLE_MIDDLE_R },
      duration: DOT_ENLARGE_DURATION,
    })
    tl.set(circleMiddle, { opacity: 1 })
    tl.set(dropLower, { autoAlpha: 0 })
    tl.fromTo(
      bodyLower,
      { opacity: 0 },
      { opacity: 1, duration: BODY_FADE_DURATION },
      '<' // start exactly when the dot reaches full size
    )

    /* --- Stage 2: trace middle circle → top circle ---------------------- */
    tl.addLabel('stage2')
    tl.set(dropUpper, {
      motionPath: { path: tailUpper, align: tailUpper, alignOrigin: [0.5, 0.5], start: 0 },
      attr: { rx: DROPLET_R_SMALL, ry: DROPLET_R_SMALL },
      autoAlpha: 1,
    })
    tl.fromTo(
      tailUpper,
      { drawSVG: '0% 0%' },
      { drawSVG: '0% 100%', duration: TAIL_UPPER_DURATION },
      'stage2'
    )
    tl.to(
      dropUpper,
      {
        duration: TAIL_UPPER_DURATION,
        motionPath: {
          path: tailUpper,
          align: tailUpper,
          alignOrigin: [0.5, 0.5],
          start: 0,
          end: 1,
          autoRotate: false,
        },
      },
      'stage2'
    )

    // Dot enlarges to the top circle size; upper body fades in when it
    // reaches full size.
    tl.to(dropUpper, {
      attr: { rx: CIRCLE_TOP_R, ry: CIRCLE_TOP_R },
      duration: DOT_ENLARGE_DURATION_2,
    })
    tl.set(circleTop, { opacity: 1 })
    tl.set(dropUpper, { autoAlpha: 0 })
    tl.fromTo(bodyUpper, { opacity: 0 }, { opacity: 1, duration: BODY_FADE_DURATION }, '<')

    /* --- Stage 3: final pulse glow -------------------------------------- */
    tl.call(() => {
      pulseGlowGroup.innerHTML = ''
      allDrawn.forEach((el) => {
        const copy = el.cloneNode(true) as SVGElement
        copy.setAttribute('opacity', '1')
        pulseGlowGroup.appendChild(copy)
      })

      gsap.fromTo(
        pulseGlowGroup,
        { opacity: 0 },
        {
          opacity: PULSE_OPACITY_PEAK,
          duration: PULSE_FADE_IN_DURATION,
          onComplete: () => {
            gsap.to(pulseGlowGroup, {
              opacity: FINAL_GLOW_OPACITY,
              duration: PULSE_FADE_OUT_DURATION,
            })
          },
        }
      )
    })

    tl.call(() => {
      sessionStorage.setItem('logoAnimated', 'true')
    })

    return () => {
      tl.kill()
      gsap.killTweensOf('*')
    }
  }, [shouldReduceMotion])

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {/* ---------- SVG START ---------- */}
      <svg
        ref={svgRef}
        viewBox="0 0 1024 1024"
        className="h-[300px] w-[300px] md:h-[380px] md:w-[380px]"
      >
        <defs>
          <filter
            id="glow"
            x="-50%"
            y="-50%"
            width="300%"
            height="300%"
            filterUnits="userSpaceOnUse"
          >
            <feGaussianBlur stdDeviation="15" result="coloredBlur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.8" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="dropGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-accent-secondary)" stopOpacity="1" />
            <stop
              offset="100%"
              stopColor="var(--color-accent-secondary-lightest)"
              stopOpacity="1"
            />
          </linearGradient>
        </defs>

        {/* Lower body (greenish) — mid-section wings around the middle circle */}
        <path
          id="body-lower"
          fill="none"
          stroke="var(--color-accent-primary)"
          strokeWidth="12"
          strokeMiterlimit="10"
          opacity="0"
          d="M513.29,643.59h-34.47c0,0-17.19,28.96-25.79,43.44c-38.33-49-76.39-98.05-114.46-147.1
            c16.26-36.6,22.67-47.34,42.18-86.18c29.45-7.02,59.2-12.22,88.95-17.42l42.46,19.72 M511.28,643.59h33.9
            c0,0,17.19,28.96,25.79,43.44c38.33-49,76.39-98.05,114.46-147.1c-16.26-36.6-22.67-47.34-42.18-86.18
            c-29.45-7.02-59.2-12.22-88.95-17.42l-42.46,19.72"
        />

        {/* Upper body (greenish) — large head shell */}
        <path
          id="body-upper"
          fill="none"
          stroke="var(--color-accent-primary)"
          strokeWidth="12"
          strokeMiterlimit="10"
          opacity="0"
          d="M512,418.82l-52.52-25.35c-35.72,6.25-71.44,12.49-106.79,20.92c-23.43,46.62-46.86,93.24-64.68,137.67
            c-67.63-88.58-81.45-215.17-34.51-316.25S399.1,63.59,510.65,62.85 M512,419.71l52.52-26.24c35.72,6.25,71.44,12.49,106.79,20.92
            c23.43,46.62,46.86,93.24,64.68,137.67c67.63-88.58,81.45-215.17,34.51-316.25C723.57,134.72,622.19,63.59,510.65,62.85"
        />

        {/* Tail — lower segment (bottom → middle circle). Defined bottom-up so
            DrawSVG and MotionPath both progress upward. */}
        <path
          id="tail-lower"
          fill="none"
          stroke="var(--color-accent-secondary)"
          strokeLinecap="round"
          strokeWidth="12"
          opacity="0"
          d="M511.74,957.89 L512,545.89"
        />

        {/* Tail — upper segment (middle circle → top circle). Defined bottom-up. */}
        <path
          id="tail-upper"
          fill="none"
          stroke="var(--color-accent-secondary)"
          strokeLinecap="round"
          strokeWidth="12"
          opacity="0"
          d="M512,545.89 L512,246.08"
        />

        {/* Middle circle (smaller dot) */}
        <circle
          id="circle-middle"
          cx="512"
          cy="545.89"
          r="22.75"
          fill="var(--color-accent-secondary)"
          stroke="var(--color-accent-secondary)"
          strokeWidth="6"
          opacity="0"
        />

        {/* Top circle (bigger dot) */}
        <circle
          id="circle-top"
          cx="512"
          cy="246.08"
          r="56.7"
          fill="var(--color-accent-secondary)"
          stroke="var(--color-accent-secondary)"
          strokeWidth="6"
          opacity="0"
        />

        <g id="pulseGlowGroup" filter="url(#glow)" opacity="0" />
      </svg>
      {/* ---------- SVG END ---------- */}
    </div>
  )
}
