'use client'

import LogoAnimation from './LogoAnimation'

export default function Hero() {
  return (
    <section className="/* header spacing */ relative flex min-h-[60vh] flex-col items-center justify-center pt-24 pb-16 md:min-h-[70vh]">
      <div className="flex items-center justify-center">
        <LogoAnimation />
      </div>
    </section>
  )
}
