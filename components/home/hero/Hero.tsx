'use client'

import LogoAnimation from './LogoAnimation'
import TextAnimation from './TextAnimation'

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center gap-10 pt-16 pb-8 xl:flex-row">
      {/* Left: Logo */}
      <div className="flex w-full justify-center md:w-auto md:flex-none">
        <LogoAnimation />
      </div>

      {/* Right: Animated text */}
      <div className="flex w-full justify-center md:w-auto md:flex-none">
        <TextAnimation />
      </div>
    </section>
  )
}
