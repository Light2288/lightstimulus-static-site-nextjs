'use client'

import Image from '@/components/Image'
import { motion } from 'motion/react'
import { useLanguage } from '@/contexts/LanguageContext'

type Certification = {
  title: string
  issuer: string
  year: number
  image?: string
  url?: string
}

export function CertificationsGrid({ items }: { items: Certification[] }) {
  const { t } = useLanguage()

  if (!items.length) return null

  return (
    <section className="mt-16">
      <h2 className="mb-6 inline-block bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] bg-clip-text text-2xl font-semibold text-transparent">
        {t('about.certifications.title')}
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((cert) => (
          <motion.div
            key={cert.title}
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="glass-bg flex h-full flex-col rounded-xl border border-white/20 p-5 shadow-md backdrop-blur transition-shadow hover:shadow-lg dark:border-white/10"
          >
            <div className="flex flex-1 items-start gap-3">
              {cert.image && (
                <Image
                  src={cert.image}
                  alt={cert.issuer}
                  width={36}
                  height={36}
                  className="mt-0.5 rounded"
                />
              )}

              <div className="flex flex-col">
                <h3 className="text-sm leading-snug font-semibold">{cert.title}</h3>
                <p className="text-text-secondary mt-1 text-xs">
                  {cert.issuer} · {cert.year}
                </p>
              </div>
            </div>

            {cert.url && (
              <a
                href={cert.url}
                target="_blank"
                rel="noreferrer"
                className="mt-auto pt-3 text-xs font-medium text-[var(--color-primary-500)] hover:underline"
              >
                {t('about.certifications.view')}
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  )
}
