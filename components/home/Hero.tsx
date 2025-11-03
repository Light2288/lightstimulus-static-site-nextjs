'use client'

export default function Hero() {
  return (
    <section
      id="hero"
      data-hero-sentinel
      className="relative flex min-h-[60vh] flex-col items-center justify-center text-center"
    >
      <h1 className="text-4xl font-bold sm:text-5xl">LightStimulus.dev</h1>
      <p className="mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-300">
        Personal playground of Davide — exploring AI, XR, and front-end architectures.
      </p>
    </section>
  )
}
