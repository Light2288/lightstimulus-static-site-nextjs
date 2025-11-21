'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { DrawSVGPlugin, MotionPathPlugin } from 'gsap/all'
import { detectRefreshOrFirstLoad } from '../../../utils/detectRefreshOrFirstLoad'

gsap.registerPlugin(MotionPathPlugin, DrawSVGPlugin)

export default function LogoAnimation() {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!svgRef.current) return
    const svg = svgRef.current

    // Elements
    const tail = svg.querySelector('#tail') as SVGPathElement
    const leftShell = svg.querySelector('#left-shell') as SVGPathElement
    const rightShell = svg.querySelector('#right-shell') as SVGPathElement
    const pulseGlowGroup = svg.querySelector('#pulseGlowGroup') as SVGGElement

    /* =======================================================================
       CASE 1 — Animation should NOT run
       We immediately set everything to final, fully visible state
    ======================================================================= */
    const shouldAnimate = detectRefreshOrFirstLoad('logo_mount_ts')

    if (!shouldAnimate) {
      const drops = svg.querySelectorAll('ellipse')
      drops.forEach((el) => {
        el.style.opacity = '0'
        el.style.visibility = 'hidden'
      })

      gsap.set([tail, leftShell, rightShell], {
        opacity: 1,
        drawSVG: '0% 100%',
        filter: 'url(#glow)',
      })

      // Soft final glow
      gsap.set(pulseGlowGroup, {
        opacity: 0.2,
      })
      return
    }

    /* =======================================================================
       CASE 2 — FIRST LOAD → Run full animation
    ======================================================================= */

    // Utility function for moving droplets along the paths
    function createDrop() {
      const drop = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
      drop.setAttribute('rx', '35')
      drop.setAttribute('ry', '20')
      drop.setAttribute('fill', 'url(#dropGradient)')
      drop.setAttribute('filter', 'url(#glow)')
      svg.appendChild(drop)
      return drop
    }

    // Create drops
    const tailDrop = createDrop()
    const leftDrop = createDrop()
    const rightDrop = createDrop()

    // Initialization
    gsap.set([tail, leftShell, rightShell], {
      opacity: 1,
      filter: 'url(#glow)',
    })
    gsap.set([leftDrop, rightDrop], { autoAlpha: 0 })

    // Position drops at path start
    gsap.set(tailDrop, {
      motionPath: { path: tail, align: tail, alignOrigin: [0.5, 0.5], start: 0 },
      autoAlpha: 1,
    })
    gsap.set(leftDrop, {
      motionPath: { path: leftShell, align: leftShell, alignOrigin: [0.5, 0.5], start: 0 },
      autoAlpha: 0,
    })
    gsap.set(rightDrop, {
      motionPath: { path: rightShell, align: rightShell, alignOrigin: [0.5, 0.5], start: 0 },
      autoAlpha: 0,
    })

    /* ===========================
        Full GSAP Timeline
    ============================ */
    const tl = gsap.timeline({ defaults: { ease: 'none' } })

    // 1. Tail
    tl.fromTo(tail, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 1 }, 0)
    tl.to(
      tailDrop,
      {
        duration: 1,
        motionPath: {
          path: tail,
          align: tail,
          alignOrigin: [0.5, 0.5],
          start: 0,
          end: 1,
          autoRotate: true,
        },
        onComplete: () => {
          gsap.set(tailDrop, { autoAlpha: 0 })
        },
      },
      0
    )

    // 2. Shells
    tl.addLabel('shellsStart', '+=0')
    tl.set([leftDrop, rightDrop], { autoAlpha: 1 }, 'shellsStart')

    tl.fromTo(
      [leftShell, rightShell],
      { drawSVG: '0% 0%' },
      { drawSVG: '0% 100%', duration: 1.2 },
      'shellsStart'
    )

    let shellsDone = 0
    const onShellDone = () => {
      shellsDone++
      if (shellsDone === 2) gsap.set([leftDrop, rightDrop], { autoAlpha: 0 })
    }

    tl.to(
      leftDrop,
      {
        duration: 1.2,
        motionPath: {
          path: leftShell,
          align: leftShell,
          alignOrigin: [0.5, 0.5],
          start: 0,
          end: 1,
        },
        onComplete: onShellDone,
      },
      'shellsStart'
    )

    tl.to(
      rightDrop,
      {
        duration: 1.2,
        motionPath: {
          path: rightShell,
          align: rightShell,
          alignOrigin: [0.5, 0.5],
          start: 0,
          end: 1,
        },
        onComplete: onShellDone,
      },
      'shellsStart'
    )

    // 3. Final pulse
    tl.call(() => {
      pulseGlowGroup.innerHTML = ''
      ;[tail, leftShell, rightShell].forEach((p) => {
        const copy = p.cloneNode(true)
        pulseGlowGroup.appendChild(copy)
      })

      gsap.fromTo(
        pulseGlowGroup,
        { opacity: 0 },
        {
          opacity: 0.6,
          duration: 0.4,
          onComplete: () => {
            gsap.to(pulseGlowGroup, { opacity: 0, duration: 1 })
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
  }, [])

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {/* SVG stays exactly the same as your original */}
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

        {/* Tail */}
        <path
          id="tail"
          fill="none"
          stroke="var(--color-accent-secondary)"
          strokeLinecap="round"
          strokeWidth="25"
          d="M512.5,916.5 L512.5,124.5"
          opacity="0"
        />

        {/* Left Shell */}
        <path
          id="left-shell"
          fill="none"
          stroke="var(--color-accent-secondary)"
          strokeWidth="25"
          strokeLinecap="round"
          strokeMiterlimit="10"
          opacity="0"
          d="m512,119c-66.85.02-133.7,21.32-185.41,63.87-103.35,85.05-135,245.76-70.24,366.38,6.13-12.8,24.69-48.75,49.03-69.54,26.5-22.64,65.83-31.36,64.39-28.68l.52.35c.17.17.34.34-.17,3.53-.06,15.54,9.26,50.17,19.82,61.48,24.1,25.84,51.86,31.3,64.62,48.45"
        />

        {/* Right Shell */}
        <path
          id="right-shell"
          fill="none"
          stroke="var(--color-accent-secondary)"
          strokeWidth="25"
          strokeLinecap="round"
          strokeMiterlimit="10"
          opacity="0"
          d="m512,119c66.85.02,133.7,21.32,185.41,63.87,103.35,85.05,135,245.76,70.24,366.38-6.13-12.8-24.69-48.75-49.03-69.54-26.5-22.64-65.83-31.36-64.39-28.68l-.52.35c-.17.17-.34.34.17,3.53.06,15.54-9.26,50.17-19.82,61.48-24.1,25.84-51.86,31.3-64.62,48.45"
        />

        <g id="pulseGlowGroup" filter="url(#glow)" opacity="0" />
      </svg>
      {/* ---------- SVG END ---------- */}
    </div>
  )
}
