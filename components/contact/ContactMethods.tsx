'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import SocialIcon from '@/components/social-icons'

type Props = {
  email?: string
  linkedin?: string
}

export function ContactMethods({ email, linkedin }: Props) {
  const { t } = useLanguage()

  return (
    <section className="glass-bg mx-auto mt-12 max-w-xl translate-y-1 animate-[fadeInUp_0.4s_ease-out_0.1s_forwards] rounded-xl border border-white/20 p-6 text-center opacity-0 shadow-md backdrop-blur dark:border-white/10">
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">{t('contact.methods_intro')}</p>

      <div className="flex flex-col items-center gap-4">
        {email && (
          <a
            href={`mailto:${email}`}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200 font-medium hover:underline"
          >
            {email}
          </a>
        )}

        {linkedin && (
          <p className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <SocialIcon kind="linkedin" href={linkedin} />

            <span>
              {t('contact.linkedin_hint')}
              <a
                href={linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200 font-medium hover:underline"
              >
                LinkedIn
              </a>
            </span>
          </p>
        )}
      </div>
    </section>
  )
}
