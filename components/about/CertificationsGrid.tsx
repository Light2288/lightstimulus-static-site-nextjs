'use client'

import Image from '@/components/Image'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { PreferencesService } from '@/lib/preferences/PreferencesService'
import {
  groupCertifications,
  type Certification,
  type GroupingMode,
} from '@/components/about/certificationGrouping'

const GROUPING_MODES: GroupingMode[] = ['year', 'issuer']

function isGroupingMode(value: string | null): value is GroupingMode {
  return value === 'year' || value === 'issuer'
}

export function CertificationsGrid({ items }: { items: Certification[] }) {
  const { t, lang } = useLanguage()
  const [groupingMode, setGroupingMode] = useState<GroupingMode>('year')
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])

  // Hydrate the saved preference on mount (client-only; falls back to 'year').
  useEffect(() => {
    const saved = PreferencesService.getPref('certGrouping')
    if (isGroupingMode(saved)) setGroupingMode(saved)
  }, [])

  if (!items.length) return null

  const selectMode = (mode: GroupingMode) => {
    setGroupingMode(mode)
    PreferencesService.setPref('certGrouping', mode)
  }

  // Roving keyboard handling for the radiogroup.
  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    let nextIndex = index
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (index + 1) % GROUPING_MODES.length
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (index - 1 + GROUPING_MODES.length) % GROUPING_MODES.length
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        selectMode(GROUPING_MODES[index])
        return
      default:
        return
    }
    event.preventDefault()
    selectMode(GROUPING_MODES[nextIndex])
    optionRefs.current[nextIndex]?.focus()
  }

  const modeLabels: Record<GroupingMode, string> = {
    year: t('about.certifications.byYear'),
    issuer: t('about.certifications.byIssuer'),
  }

  const groups = groupCertifications(items, groupingMode, t('about.certifications.other'))

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="inline-block bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] bg-clip-text text-2xl font-semibold text-transparent">
          {t('about.certifications.title')}
        </h2>

        <div
          role="radiogroup"
          aria-label={t('about.certifications.groupBy')}
          className="glass-bg inline-flex rounded-lg border border-white/20 p-1 shadow-sm backdrop-blur dark:border-white/10"
        >
          {GROUPING_MODES.map((mode, index) => {
            const selected = groupingMode === mode
            return (
              <button
                key={mode}
                ref={(el) => {
                  optionRefs.current[index] = el
                }}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => selectMode(mode)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={`focus-visible:ring-primary-500 rounded-md px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 ${
                  selected
                    ? 'bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] text-white shadow'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {modeLabels[mode]}
              </button>
            )
          })}
        </div>
      </div>

      <div aria-live="polite" className="space-y-10">
        {groups.map((group) => (
          <div key={group.key}>
            <h3 className="text-text-secondary mb-4 text-sm font-semibold tracking-wide uppercase">
              {group.label} <span className="opacity-60">({group.count})</span>
            </h3>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((cert) => (
                <CertificationCard key={cert.title} cert={cert} lang={lang} t={t} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function CertificationCard({
  cert,
  lang,
  t,
}: {
  cert: Certification
  lang: string
  t: (key: string) => string
}) {
  const expiry = getExpiryInfo(cert.expiryDate, lang)

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="glass-bg flex h-full flex-col rounded-xl border border-white/20 p-5 shadow-md backdrop-blur transition-shadow hover:shadow-lg dark:border-white/10"
    >
      <div className="flex flex-1 items-start gap-3">
        {cert.image && (
          <div className="h-[72px] w-[72px] flex-shrink-0">
            <Image
              src={cert.image}
              alt={cert.issuer}
              width={72}
              height={72}
              className="h-full w-full rounded object-cover"
            />
          </div>
        )}

        <div className="flex flex-col">
          <h4 className="text-sm leading-snug font-semibold">{cert.title}</h4>
          <p className="text-text-secondary mt-1 text-xs">
            {cert.issuer} · {cert.year}
          </p>

          {expiry ? (
            <p className="mt-2">
              {expiry.expired ? (
                <span className="inline-flex items-center rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-medium text-red-600 dark:bg-red-400/15 dark:text-red-300">
                  {t('about.certifications.expired')}
                </span>
              ) : (
                <span className="text-text-secondary text-[11px]">
                  {t('about.certifications.expires')} {expiry.label}
                </span>
              )}
            </p>
          ) : (
            <p className="mt-2">
              <span className="text-text-secondary text-[11px]">
                {t('about.certifications.noExpiration')}
              </span>
            </p>
          )}
        </div>
      </div>

      {cert.url && (
        <a
          href={cert.url}
          target="_blank"
          rel="noreferrer"
          className="text-primary-600 hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200 mt-auto pt-3 text-xs font-medium hover:underline"
        >
          {t('about.certifications.view')}
        </a>
      )}
    </motion.div>
  )
}

/**
 * Parse an ISO expiry date and derive its display label + expired flag.
 * A credential is considered expired only strictly after its expiry date
 * (an expiry date equal to today is still valid).
 */
function getExpiryInfo(
  expiryDate: string | undefined,
  lang: string
): { label: string; expired: boolean } | null {
  if (!expiryDate) return null

  const expiry = new Date(expiryDate)
  if (Number.isNaN(expiry.getTime())) return null

  const label = new Intl.DateTimeFormat(lang === 'it' ? 'it-IT' : 'en-US', {
    month: 'short',
    year: 'numeric',
  }).format(expiry)

  // Compare date-only (ignore time-of-day). Expired = strictly after expiry.
  const today = new Date()
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const expiryDateOnly = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate())
  const expired = todayDateOnly.getTime() > expiryDateOnly.getTime()

  return { label, expired }
}
