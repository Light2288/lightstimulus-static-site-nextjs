'use client'

import LogoSVG from '@/data/logo.svg'

export default function LogoStatic() {
  return (
    <div className="flex items-center gap-x-0">
      {/* Logo SVG */}
      <div className="h-12 w-12 flex-shrink-0 md:h-16 md:w-16">
        <LogoSVG />
      </div>

      {/* Text */}
      <div className="flex flex-col items-center">
        {/* First row: "LI" in orange, rest in gray */}
        <span className="text-2xl leading-none font-bold text-gray-600 md:text-3xl dark:text-gray-300">
          <span className="text-[var(--color-accent-secondary)]">LI</span>GHT
        </span>

        {/* Second row: "STIMULUS" with "MULUS" in orange, scaled down */}
        <span className="-mt-1 text-lg font-semibold text-gray-600 md:text-xl dark:text-gray-300">
          STI<span className="text-[var(--color-accent-secondary)]">MULUS</span>
        </span>
      </div>
    </div>
  )
}
