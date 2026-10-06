'use client'

import { useState } from 'react'
import Image from '@/components/Image'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Portrait } from './portraitData'

export type PortraitCarouselProps = {
  portraits: Portrait[]
  fallbackAvatar?: string
  fallbackAlt: string
}

export default function PortraitCarousel(props: PortraitCarouselProps) {
  const { portraits } = props
  const { lang, t } = useLanguage()
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const [activeVariantIndex, setActiveVariantIndex] = useState(0)
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

  const cycleVariant = () => {
    setActiveVariantIndex((current) => (current + 1) % states.length)
  }

  const selectPhoto = (index: number) => {
    setActivePhotoIndex((index + portraits.length) % portraits.length)
    setActiveVariantIndex(0)
  }

  const navigatePhoto = (offset: number) => selectPhoto(activePhotoIndex + offset)

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <button
          type="button"
          onClick={cycleVariant}
          aria-label={`${title}. ${stateCounter}. ${t('about.profile.carousel.cycle_variant', { title })}`}
          className="focus-visible:ring-primary-500 relative h-40 w-40 overflow-hidden rounded-full shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:h-44 sm:w-44 dark:focus-visible:ring-offset-gray-900"
        >
          <Image
            key={`${activePortrait.id}-${activeState.id}`}
            src={activeState.src}
            alt=""
            width={176}
            height={176}
            sizes="(min-width: 640px) 176px, 160px"
            className="h-full w-full object-cover"
            style={{ objectPosition: activePortrait.focalPoint }}
          />
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
    </div>
  )
}
