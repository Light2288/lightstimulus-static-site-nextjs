'use client'

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { AnimatePresence, motion, useIsPresent } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import Image from '@/components/Image'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Portrait } from './portraitData'

export type PortraitLightboxProps = {
  open: boolean
  portraits: Portrait[]
  activePhotoIndex: number
  title: string
  stateLabel: string
  displaySrc?: string
  displayKey: string
  failureStage: 'active' | 'original' | 'avatar'
  fallbackAlt: string
  canRecoverFromImageError: boolean
  transitionKind: 'photo' | 'variant'
  transitionDirection: number
  shouldReduceMotion: boolean
  onClose: () => void
  onCycleVariant: () => void
  onNavigatePhoto: (offset: number) => void
  onSelectPhoto: (index: number) => void
  onImageError: () => void
}

const controlClass =
  'focus-visible:ring-primary-500 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-2xl leading-none text-gray-700 shadow-sm transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-800/90 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus-visible:ring-offset-gray-900'

const nativeWidthSources: Record<string, string> = {
  '/static/images/about/portraits/guitar_session.png':
    '/static/images/about/portraits/responsive/guitar_session-636w.webp',
  '/static/images/avatar.png': '/static/images/responsive/avatar-225w.webp',
}

type LightboxImageFrameProps = {
  src: string
  alt: string
  displayKey: string
  transitionKind: 'photo' | 'variant'
  motionOffset: number
  transitionDuration: number
  shouldReduceMotion: boolean
  onError: () => void
}

function LightboxImageFrame({
  src,
  alt,
  displayKey,
  transitionKind,
  motionOffset,
  transitionDuration,
  shouldReduceMotion,
  onError,
}: LightboxImageFrameProps) {
  const isPresent = useIsPresent()

  return (
    <motion.div
      key={displayKey}
      data-testid="portrait-lightbox-image-frame"
      initial={
        shouldReduceMotion
          ? false
          : transitionKind === 'photo'
            ? { opacity: 0, x: motionOffset }
            : { opacity: 0, scale: 0.985 }
      }
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={
        shouldReduceMotion
          ? { opacity: 1, x: 0, scale: 1 }
          : transitionKind === 'photo'
            ? { opacity: 0, x: -motionOffset }
            : { opacity: 0, scale: 1.015 }
      }
      transition={{ duration: transitionDuration, ease: [0.4, 0, 0.2, 1] }}
      className="absolute inset-0"
    >
      <Image
        src={nativeWidthSources[src] ?? src}
        alt={isPresent ? alt : ''}
        fill
        sizes="(min-width: 1024px) 896px, calc(100vw - 8rem)"
        className="object-contain"
        onError={onError}
      />
    </motion.div>
  )
}

export default function PortraitLightbox({
  open,
  portraits,
  activePhotoIndex,
  title,
  stateLabel,
  displaySrc,
  displayKey,
  failureStage,
  fallbackAlt,
  canRecoverFromImageError,
  transitionKind,
  transitionDirection,
  shouldReduceMotion,
  onClose,
  onCycleVariant,
  onNavigatePhoto,
  onSelectPhoto,
  onImageError,
}: PortraitLightboxProps) {
  const { lang, t } = useLanguage()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [imageUnavailable, setImageUnavailable] = useState(false)
  const motionOffset = transitionKind === 'photo' ? transitionDirection * 20 : 0
  const transitionDuration = shouldReduceMotion ? 0 : transitionKind === 'photo' ? 0.22 : 0.3

  useEffect(() => {
    setImageUnavailable(false)
  }, [displayKey, open])

  const handleImageError = () => {
    if (canRecoverFromImageError) {
      onImageError()
      return
    }

    setImageUnavailable(true)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      initialFocus={closeButtonRef}
      data-motion={shouldReduceMotion ? 'reduced' : 'standard'}
      className="relative z-50"
    >
      <DialogBackdrop
        data-testid="portrait-lightbox-backdrop"
        className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm"
      />
      <div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
        <DialogPanel
          data-testid="portrait-lightbox-panel"
          className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-5xl flex-col overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-6 dark:bg-gray-900"
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t('about.profile.carousel.close_lightbox')}
            className={`${controlClass} absolute top-3 right-3 z-20`}
          >
            <span aria-hidden="true">×</span>
          </button>

          <DialogTitle className="pr-14 text-lg font-semibold text-gray-900 dark:text-white">
            {t('about.profile.carousel.lightbox_title', { title })}
          </DialogTitle>

          <button
            type="button"
            onClick={onCycleVariant}
            aria-label={`${t('about.profile.carousel.change_style')}: ${stateLabel}`}
            className="focus-visible:ring-primary-500 mt-2 flex min-h-11 w-fit max-w-full items-center gap-2 self-center rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:focus-visible:ring-offset-gray-900"
          >
            <span>{stateLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{t('about.profile.carousel.change_style')}</span>
            <span aria-hidden="true">↻</span>
          </button>

          <div className="mt-3 grid min-h-64 grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-2 sm:gap-4">
            <button
              type="button"
              aria-label={t('about.profile.carousel.previous_photo')}
              onClick={() => onNavigatePhoto(-1)}
              className={controlClass}
            >
              <span aria-hidden="true">‹</span>
            </button>

            <div className="relative h-[min(62dvh,42rem)] min-h-64 min-w-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-950">
              {imageUnavailable ? (
                <div className="flex h-full items-center justify-center p-6 text-center text-sm font-medium text-gray-600 dark:text-gray-300">
                  {t('about.profile.carousel.image_unavailable')}
                </div>
              ) : (
                <AnimatePresence initial={false} mode="sync">
                  {displaySrc && (
                    <LightboxImageFrame
                      key={displayKey}
                      src={displaySrc}
                      alt={
                        failureStage === 'avatar'
                          ? fallbackAlt
                          : t('about.profile.carousel.lightbox_image_alt', {
                              title,
                              state: stateLabel,
                            })
                      }
                      displayKey={displayKey}
                      transitionKind={transitionKind}
                      motionOffset={motionOffset}
                      transitionDuration={transitionDuration}
                      shouldReduceMotion={shouldReduceMotion}
                      onError={handleImageError}
                    />
                  )}
                </AnimatePresence>
              )}
            </div>

            <button
              type="button"
              aria-label={t('about.profile.carousel.next_photo')}
              onClick={() => onNavigatePhoto(1)}
              className={controlClass}
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
            {portraits.map((portrait, index) => {
              const isActive = index === activePhotoIndex
              const dotTitle = portrait.title[lang]

              return (
                <button
                  key={portrait.id}
                  type="button"
                  aria-label={t('about.profile.carousel.select_photo', { title: dotTitle })}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => onSelectPhoto(index)}
                  className="group focus-visible:ring-primary-500 flex h-11 w-11 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                >
                  <span
                    aria-hidden="true"
                    className={`h-3 w-3 rounded-full transition-colors ${
                      isActive
                        ? 'bg-primary-500 dark:bg-primary-400'
                        : 'bg-gray-300 group-hover:bg-gray-400 dark:bg-gray-600 dark:group-hover:bg-gray-500'
                    }`}
                  />
                </button>
              )
            })}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
