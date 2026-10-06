'use client'

import { type KeyboardEvent, type PointerEvent as ReactPointerEvent, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Image from '@/components/Image'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Portrait } from './portraitData'

export type PortraitCarouselProps = {
  portraits: Portrait[]
  fallbackAvatar?: string
  fallbackAlt: string
}

export default function PortraitCarousel(props: PortraitCarouselProps) {
  const { portraits, fallbackAvatar } = props
  const { lang, t } = useLanguage()
  const shouldReduceMotion = useReducedMotion()
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const [activeVariantIndex, setActiveVariantIndex] = useState(0)
  const [announcementKind, setAnnouncementKind] = useState<'photo' | 'state' | 'fallback' | null>(
    null
  )
  const [failureStage, setFailureStage] = useState<'active' | 'original' | 'avatar'>('active')
  const [transitionKind, setTransitionKind] = useState<'photo' | 'variant'>('variant')
  const [transitionDirection, setTransitionDirection] = useState(1)
  const [transitionId, setTransitionId] = useState(0)
  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const suppressClick = useRef(false)
  const activePortrait = portraits[activePhotoIndex]

  if (!activePortrait) return null

  const states = [
    {
      id: 'original',
      label: t('about.profile.carousel.original'),
      src: activePortrait.original,
    },
    ...activePortrait.variants.map((variant) => ({
      id: variant.id,
      label: variant.label[lang],
      src: variant.src,
    })),
  ]
  const activeState = states[activeVariantIndex]
  const title = activePortrait.title[lang]
  const position = activeVariantIndex + 1
  const stateCounter = `${activeState.label} · ${position}/${states.length}`
  const announcement =
    announcementKind === 'fallback'
      ? t('about.profile.carousel.image_fallback')
      : announcementKind
        ? t(`about.profile.carousel.${announcementKind}_announcement`, {
            title,
            state: activeState.label,
            position,
            total: states.length,
          })
        : ''
  const displaySrc =
    failureStage === 'avatar'
      ? fallbackAvatar
      : failureStage === 'original'
        ? activePortrait.original
        : activeState.src
  const displayKey = `${activePortrait.id}-${activeState.id}-${failureStage}-${transitionId}`
  const motionOffset = transitionKind === 'photo' ? transitionDirection * 12 : 0
  const transitionDuration = shouldReduceMotion ? 0 : transitionKind === 'photo' ? 0.22 : 0.16

  const resetFailure = () => setFailureStage('active')

  const cycleVariant = () => {
    resetFailure()
    setTransitionKind('variant')
    setTransitionId((current) => current + 1)
    setActiveVariantIndex((current) => (current + 1) % states.length)
    setAnnouncementKind('state')
  }

  const selectPhoto = (index: number, direction?: number) => {
    const nextIndex = (index + portraits.length) % portraits.length
    setTransitionKind('photo')
    setTransitionDirection(direction ?? (nextIndex >= activePhotoIndex ? 1 : -1))
    setTransitionId((current) => current + 1)
    setActivePhotoIndex(nextIndex)
    setActiveVariantIndex(0)
    resetFailure()
    setAnnouncementKind('photo')
  }

  const navigatePhoto = (offset: number) =>
    selectPhoto(activePhotoIndex + offset, Math.sign(offset))

  const handleImageError = () => {
    if (failureStage === 'avatar') return

    setTransitionKind('variant')
    setTransitionId((current) => current + 1)
    if (failureStage === 'active' && activeVariantIndex > 0) {
      setActiveVariantIndex(0)
      setFailureStage('original')
      setAnnouncementKind('fallback')
      return
    }

    if (fallbackAvatar) {
      setFailureStage('avatar')
      setAnnouncementKind('fallback')
    }
  }

  const handlePortraitKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      navigatePhoto(event.key === 'ArrowLeft' ? -1 : 1)
    }
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    pointerStart.current = { x: event.clientX, y: event.clientY }
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const start = pointerStart.current
    pointerStart.current = null
    if (!start) return

    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) >= 32 && Math.abs(dx) > Math.abs(dy)) {
      suppressClick.current = true
      navigatePhoto(dx < 0 ? 1 : -1)
    }
  }

  const handlePortraitClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    cycleVariant()
  }

  return (
    <div
      data-testid="portrait-carousel"
      data-motion={shouldReduceMotion ? 'reduced' : 'standard'}
      className="flex flex-col items-center"
    >
      <div className="relative">
        <button
          type="button"
          onClick={handlePortraitClick}
          onKeyDown={handlePortraitKeyDown}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          aria-label={`${title}. ${stateCounter}. ${t('about.profile.carousel.cycle_variant', { title })}`}
          className="focus-visible:ring-primary-500 relative h-40 w-40 touch-pan-y overflow-hidden rounded-full shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:h-44 sm:w-44 dark:focus-visible:ring-offset-gray-900"
        >
          <AnimatePresence initial={false} mode="sync">
            {displaySrc && (
              <motion.div
                key={displayKey}
                initial={shouldReduceMotion ? false : { opacity: 0, x: motionOffset }}
                animate={{ opacity: 1, x: 0 }}
                exit={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -motionOffset }}
                transition={{ duration: transitionDuration, ease: 'easeOut' }}
                className="absolute inset-0"
              >
                <Image
                  src={displaySrc}
                  alt=""
                  width={176}
                  height={176}
                  sizes="(min-width: 640px) 176px, 160px"
                  className="h-full w-full object-cover"
                  style={{ objectPosition: activePortrait.focalPoint }}
                  onError={handleImageError}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-white backdrop-blur-sm">
            {stateCounter}
          </span>
        </button>

        <button
          type="button"
          aria-label={t('about.profile.carousel.previous_photo')}
          onClick={() => navigatePhoto(-1)}
          className="focus-visible:ring-primary-500 absolute top-1/2 -left-11 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/85 text-xl text-gray-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 dark:border-gray-700 dark:bg-gray-900/85 dark:text-gray-200 dark:hover:bg-gray-900"
        >
          <span aria-hidden="true">‹</span>
        </button>
        <button
          type="button"
          aria-label={t('about.profile.carousel.next_photo')}
          onClick={() => navigatePhoto(1)}
          className="focus-visible:ring-primary-500 absolute top-1/2 -right-11 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/85 text-xl text-gray-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 dark:border-gray-700 dark:bg-gray-900/85 dark:text-gray-200 dark:hover:bg-gray-900"
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <div data-testid="portrait-caption" className="mt-3 text-center">
        <p
          data-testid="portrait-title"
          className="text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {title}
        </p>
        <div className="mt-2 flex items-center justify-center gap-2">
          {portraits.map((portrait, index) => {
            const dotTitle = portrait.title[lang]
            const isActive = index === activePhotoIndex

            return (
              <button
                key={portrait.id}
                type="button"
                aria-label={t('about.profile.carousel.select_photo', { title: dotTitle })}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => selectPhoto(index)}
                className={`focus-visible:ring-primary-500 h-2.5 w-2.5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  isActive
                    ? 'bg-primary-500 dark:bg-primary-400'
                    : 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500'
                }`}
              />
            )
          })}
        </div>
      </div>
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  )
}
