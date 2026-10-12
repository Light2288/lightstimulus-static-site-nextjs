'use client'

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { useRef } from 'react'
import Image from '@/components/Image'
import { useLanguage } from '@/contexts/LanguageContext'

export type PortraitLightboxProps = {
  open: boolean
  title: string
  stateLabel: string
  displaySrc?: string
  onClose: () => void
  onImageError: () => void
}

export default function PortraitLightbox({
  open,
  title,
  stateLabel,
  displaySrc,
  onClose,
  onImageError,
}: PortraitLightboxProps) {
  const { t } = useLanguage()
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <Dialog open={open} onClose={onClose} initialFocus={closeButtonRef} className="relative z-50">
      <DialogBackdrop
        data-testid="portrait-lightbox-backdrop"
        className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          data-testid="portrait-lightbox-panel"
          className="relative w-full max-w-4xl rounded-2xl bg-white p-4 shadow-2xl dark:bg-gray-900"
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t('about.profile.carousel.close_lightbox')}
            className="focus-visible:ring-primary-500 absolute top-3 right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-2xl text-gray-700 shadow-sm focus:outline-none focus-visible:ring-2 dark:bg-gray-800/90 dark:text-gray-100"
          >
            <span aria-hidden="true">×</span>
          </button>

          <DialogTitle className="pr-12 text-lg font-semibold text-gray-900 dark:text-white">
            {t('about.profile.carousel.lightbox_title', { title })}
          </DialogTitle>
          <p className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-300">{stateLabel}</p>

          {displaySrc && (
            <div className="relative mt-4 h-[60vh] min-h-60 w-full">
              <Image
                src={displaySrc}
                alt={t('about.profile.carousel.lightbox_image_alt', {
                  title,
                  state: stateLabel,
                })}
                fill
                sizes="(min-width: 1024px) 896px, calc(100vw - 32px)"
                className="object-contain"
                onError={onImageError}
              />
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  )
}
