'use client'

import LogoAnimation from './LogoAnimation'
import TextAnimation from './TextAnimation'

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center gap-10 pt-16 pb-8 xl:flex-row">
      {/* Left: Logo */}
      <div className="flex items-center justify-center">
        <LogoAnimation />
      </div>

      {/* Right: Animated text */}
      <div className="flex items-center justify-center">
        <TextAnimation />
      </div>
    </section>
  )
}
