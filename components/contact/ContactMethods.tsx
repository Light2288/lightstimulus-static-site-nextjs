'use client'

import { motion } from 'motion/react'
import { useLanguage } from '@/contexts/LanguageContext'
import SocialIcon from '@/components/social-icons'

type Props = {
  email?: string
  linkedin?: string
}

export function ContactMethods({ email, linkedin }: Props) {
  const { t } = useLanguage()

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05, type: 'spring', stiffness: 180, damping: 26 }}
      className="glass-bg mx-auto mt-12 max-w-xl rounded-xl border border-white/20 p-6 text-center shadow-md backdrop-blur dark:border-white/10"
    >
      <p className="text-text-secondary mb-6 text-sm dark:text-gray-300">
        {t('contact.methods_intro')}
      </p>

      <div className="flex flex-col items-center gap-4">
        {email && (
          <a
            href={`mailto:${email}`}
            className="font-medium text-[var(--color-primary-500)] hover:underline"
          >
            {email}
          </a>
        )}

        {linkedin && (
          <p className="text-text-secondary mt-4 flex items-center gap-2 text-sm">
            <SocialIcon kind="linkedin" href={linkedin} />

            <span>
              {t('contact.linkedin_hint')}
              <a
                href={linkedin}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--color-primary-500)] hover:underline"
              >
                LinkedIn
              </a>
            </span>
          </p>
        )}
      </div>
    </motion.section>
  )
}
