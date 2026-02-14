'use client'

import Image from '@/components/Image'
import SocialIcon from '@/components/social-icons'
import clsx from 'clsx'
import { motion } from 'motion/react'
import { useLanguage } from '@/contexts/LanguageContext'

interface Props {
  name?: string
  avatar?: string
  occupation?: string
  company?: string
  socials: {
    email?: string
    github?: string
    linkedin?: string
    twitter?: string
    bluesky?: string
  }
}

export default function AboutProfile({ name, avatar, occupation, company, socials }: Props) {
  const { t } = useLanguage()

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 180, damping: 26 }}
      className={clsx(
        'glass-bg rounded-xl border border-white/20 p-6 backdrop-blur',
        'grid gap-8 md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_1fr]',
        'dark:border-white/10'
      )}
    >
      {/* Avatar */}
      {avatar && (
        <motion.div
          whileHover={{ scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="flex justify-center lg:justify-start"
        >
          <Image
            src={avatar}
            alt={name ?? 'Avatar'}
            width={144}
            height={144}
            sizes="144px"
            className="h-36 w-36 rounded-full"
          />
        </motion.div>
      )}

      {/* Identity */}
      <div className="text-center md:text-left">
        <h2 className="mb-2 inline-block bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] bg-clip-text text-2xl font-semibold text-transparent">
          {name}
        </h2>

        {occupation && <p className="text-text-secondary mt-1">{occupation}</p>}
        {company && <p className="text-text-secondary">{company}</p>}

        <div className="mt-5 flex justify-center gap-4 md:justify-start">
          {socials.email && <SocialIcon kind="mail" href={`mailto:${socials.email}`} />}
          {socials.github && <SocialIcon kind="github" href={socials.github} />}
          {socials.linkedin && <SocialIcon kind="linkedin" href={socials.linkedin} />}
        </div>
      </div>

      {/* High-signal highlights */}
      <div className="text-text-secondary space-y-3 text-sm md:col-span-2 lg:col-span-1 lg:pl-4">
        <ul className="space-y-3">
          <li>• {t('about.profile.highlights.0')}</li>
          <li>• {t('about.profile.highlights.1')}</li>
          <li>• {t('about.profile.highlights.2')}</li>
          <li>• {t('about.profile.highlights.3')}</li>
        </ul>
      </div>
    </motion.section>
  )
}
