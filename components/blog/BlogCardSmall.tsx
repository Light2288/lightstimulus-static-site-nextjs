'use client'

import Link from '@/components/Link'
import Tag from '@/components/Tag'
import { motion } from 'motion/react'
import clsx from 'clsx'
import { useLanguage } from '@/contexts/LanguageContext'
import { LocalizedTag } from '../../types/localizedTag'

interface Props {
  slug: string
  date: string
  title: string
  summary: string
  tags: LocalizedTag[]
}

export default function BlogCardSmall({ slug, date, title, summary, tags }: Props) {
  const { lang } = useLanguage()

  return (
    <motion.article
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={{ rest: { y: 0 }, hover: { y: -4 } }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={clsx(
        'group relative flex flex-col overflow-hidden rounded-xl',
        'glass-bg backdrop-blur-lg',
        'border border-white/20 dark:border-white/10',
        'shadow-md transition-shadow hover:shadow-xl'
      )}
    >
      <Link href={`/blog/${slug}`} className="flex h-full flex-col p-5">
        <time className="text-text-secondary dark:text-text-secondary-dark mb-2 text-xs">
          {new Intl.DateTimeFormat(lang, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }).format(new Date(date))}
        </time>

        <h3 className="mb-2 text-lg leading-snug font-semibold">
          <span className="bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] bg-clip-text text-transparent">
            {title}
          </span>
        </h3>

        <p className="text-text-secondary dark:text-text-secondary-dark text-sm leading-relaxed">
          {summary}
        </p>

        {tags.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-2 pt-4">
            {tags.map((tag) => (
              <li key={tag.id}>
                <Tag tag={tag} />
              </li>
            ))}
          </ul>
        )}
      </Link>
    </motion.article>
  )
}
