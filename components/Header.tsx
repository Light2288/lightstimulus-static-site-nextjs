'use client'

import { useEffect, useRef, useState } from 'react'
import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Logo from '@/data/logo.svg'
import Link from './Link'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import SearchButton from './SearchButton'
import LanguageToggle from './LanguageToggle'

/**
 * Header
 *
 * - client component (animations, intersection observer)
 * - uses IntersectionObserver to detect hero sentinel (#hero or [data-hero-sentinel])
 *   and falls back to a scroll-based approach if sentinel not found.
 * - hides on scroll down, shows on scroll up (smooth translate + opacity).
 * - becomes "solid" (glass background) after scrolling past hero or a small threshold.
 *
 * Accessibility:
 * - buttons have aria-labels
 * - keyboard focus styles are preserved via Tailwind's focus-visible outline rules
 */

const Header = () => {
  const headerRef = useRef<HTMLElement | null>(null)
  const lastScrollYRef = useRef<number>(0)
  const [isHidden, setIsHidden] = useState(false)
  const [isSolid, setIsSolid] = useState(false) // toggles the glass/solid background

  useEffect(() => {
    const headerEl = headerRef.current
    if (!headerEl) return

    // Simplified: header solid when scrolled beyond small threshold
    const onScrollSolid = () => {
      setIsSolid(window.scrollY > 40)
    }

    onScrollSolid() // initial
    window.addEventListener('scroll', onScrollSolid, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScrollSolid)
    }
  }, [])

  // Hide on scroll down / show on scroll up using a small requestAnimationFrame loop.
  // We try to avoid heavy listeners, but a lightweight scroll handler is used only to detect direction.
  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const current = window.scrollY
          const last = lastScrollYRef.current
          const delta = current - last

          // threshold to avoid micro jitter
          if (Math.abs(delta) > 6) {
            if (current > last && current > 80) {
              // scrolling down
              setIsHidden(true)
            } else {
              // scrolling up
              setIsHidden(false)
            }
          }

          lastScrollYRef.current = current
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Compose classes: glass vs transparent vs solid + hide/show transform
  const baseClass =
    'fixed left-0 right-0 z-50 transition-transform duration-300 ease-out will-change-transform'
  const translateClass = isHidden ? '-translate-y-full' : 'translate-y-0'
  // Solid when isSolid true, otherwise transparent over hero (with subtle glass)
  const bgClass = isSolid
    ? 'backdrop-blur-[var(--glass-blur)] bg-[color:var(--glass-bg-solid)] shadow-md'
    : 'bg-transparent'

  // fallback for text/colors uses the tailwind.css token variables defined globally
  return (
    <header
      ref={headerRef}
      className={`${baseClass} ${translateClass} ${bgClass}`}
      aria-label="Main Navigation"
      style={{ top: 0 }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-x-4">
            <Link href="/" aria-label={siteMetadata.headerTitle}>
              <div className="flex items-center gap-x-3">
                <div className="h-8 w-8">
                  <Logo />
                </div>
                {typeof siteMetadata.headerTitle === 'string' ? (
                  <div className="hidden text-lg font-semibold sm:block">
                    {siteMetadata.headerTitle}
                  </div>
                ) : (
                  siteMetadata.headerTitle
                )}
              </div>
            </Link>
          </div>

          <nav className="hidden items-center gap-x-6 sm:flex">
            <div className="no-scrollbar flex max-w-[36rem] gap-x-2 overflow-x-auto">
              {headerNavLinks
                .filter((link) => link.href !== '/')
                .map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    className="hover:text-accent-primary dark:hover:text-accent-primary m-1 rounded px-1 py-0.5 text-sm leading-5 font-medium"
                  >
                    {link.title}
                  </Link>
                ))}
            </div>
          </nav>

          <div className="flex items-center gap-x-3">
            {/* Search (Pliny Kbar) */}
            <div className="flex items-center">
              <SearchButton />
            </div>

            {/* Language toggle (EN / IT) */}
            <div className="flex items-center">
              <LanguageToggle />
            </div>

            {/* Theme */}
            <div className="flex items-center">
              <ThemeSwitch />
            </div>

            {/* Mobile nav trigger */}
            <div className="sm:hidden">
              <MobileNav />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
