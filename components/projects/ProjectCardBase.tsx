'use client'

import Image from '@/components/Image'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import { motion } from 'motion/react'
import clsx from 'clsx'
import { useLanguage } from '@/contexts/LanguageContext'
import { LocalizedTag } from '@/types/localizedTag'

interface Props {
  href: string
  title: string
  summary: string
  coverImage?: string
  date?: string
  tags?: LocalizedTag[]
  small?: boolean
  priority?: boolean
}

export default function ProjectCardBase({
  href,
  title,
  summary,
  coverImage,
  date,
  tags = [],
  small = false,
  priority = false,
}: Props) {
  const { lang } = useLanguage()

  return (
    <motion.article
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={{
        rest: { y: 0 },
        hover: { y: -4 },
      }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={clsx(
        'group relative flex flex-col overflow-hidden rounded-xl',
        'glass-bg backdrop-blur-lg',
        'border border-white/20 dark:border-white/10',
        'shadow-md transition-shadow hover:shadow-xl'
      )}
    >
      {coverImage && (
        <Link href={href} aria-label={title} className="relative block">
          <div className="relative overflow-hidden">
            {date && (
              <div className="absolute top-3 right-3 z-10 rounded-full bg-black/40 px-3 py-1 text-xs text-white backdrop-blur">
                <time dateTime={date}>
                  {new Intl.DateTimeFormat(lang, {
                    year: 'numeric',
                    month: 'short',
                  }).format(new Date(date))}
                </time>
              </div>
            )}

            <motion.div
              variants={{
                rest: { scale: 1 },
                hover: { scale: 1.05 },
              }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            >
              <Image
                alt={title}
                src={coverImage}
                width={600}
                height={360}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 640px"
                priority={priority}
                fetchpriority={priority ? 'high' : 'auto'}
                className={clsx('w-full object-cover', small ? 'h-40' : 'h-48')}
              />
            </motion.div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        </Link>
      )}

      <div className="p-5">
        <h2 className="mb-2 text-lg leading-snug font-semibold">
          <Link
            href={href}
            className="bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] bg-clip-text text-transparent"
          >
            {title}
          </Link>
        </h2>

        <p className="text-text-secondary dark:text-text-secondary-dark line-clamp-3 text-sm leading-relaxed">
          {summary}
        </p>

        {tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag.id}>
                <Tag tag={tag} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.article>
  )
}
