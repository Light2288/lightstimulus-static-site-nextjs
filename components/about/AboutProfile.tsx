'use client'

import Image from '@/components/Image'
import SocialIcon from '@/components/social-icons'
import clsx from 'clsx'

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
  return (
    <section
      className={clsx(
        'glass-bg rounded-2xl border border-white/20 dark:border-white/10',
        'flex flex-col items-center gap-8 p-6 sm:flex-row sm:p-8'
      )}
    >
      {avatar && (
        <Image
          src={avatar}
          alt={name ?? 'Avatar'}
          width={144}
          height={144}
          className="h-36 w-36 rounded-full"
        />
      )}

      <div className="flex-1 text-center sm:text-left">
        <h2 className="mb-6 inline-block bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] bg-clip-text text-2xl font-semibold text-transparent">
          {name}
        </h2>
        {occupation && <p className="text-text-secondary mt-1">{occupation}</p>}
        {company && <p className="text-text-secondary">{company}</p>}

        <div className="mt-5 flex justify-center gap-4 sm:justify-start">
          {socials.email && <SocialIcon kind="mail" href={`mailto:${socials.email}`} />}
          {socials.github && <SocialIcon kind="github" href={socials.github} />}
          {socials.linkedin && <SocialIcon kind="linkedin" href={socials.linkedin} />}
          {socials.twitter && <SocialIcon kind="x" href={socials.twitter} />}
          {socials.bluesky && <SocialIcon kind="bluesky" href={socials.bluesky} />}
        </div>
      </div>
    </section>
  )
}
