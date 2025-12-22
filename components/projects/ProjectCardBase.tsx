'use client'

import Image from '@/components/Image'
import Link from '@/components/Link'
import { motion } from 'motion/react'
import clsx from 'clsx'

interface Props {
  href: string
  title: string
  summary: string
  coverImage?: string
  date?: string
  tags?: string[]
  small?: boolean
}

export default function ProjectCardBase({
  href,
  title,
  summary,
  coverImage,
  date,
  tags = [],
  small,
}: Props) {
  return (
    <motion.article
      initial="rest"
      whileHover="hover"
      whileInView="rest"
      viewport={{ once: true, margin: '-80px' }}
      variants={{
        rest: { y: 0 },
        hover: { y: -5 },
      }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 26,
        mass: 0.8,
      }}
      className={clsx(
        'group relative flex h-full flex-col overflow-hidden rounded-xl',
        'glass-bg backdrop-blur-lg',
        'border border-white/25 dark:border-white/10',
        'shadow-md hover:shadow-xl',
        'transition-shadow duration-200'
      )}
    >
      {/* Glow layer */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(600px circle at 50% -20%, rgba(63,195,185,0.18), transparent 60%)',
        }}
      />

      {/* Image */}
      {coverImage && (
        <Link href={href} aria-label={title} className="relative z-10 block">
          <div className="relative overflow-hidden">
            {/* Date badge */}
            {date && (
              <div className="absolute top-3 right-3 z-20 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                <time dateTime={date}>
                  {new Intl.DateTimeFormat('en', {
                    year: 'numeric',
                    month: 'short',
                  }).format(new Date(date))}
                </time>
              </div>
            )}

            <motion.div
              variants={{
                rest: { scale: 1 },
                hover: { scale: 1.06 },
              }}
              transition={{
                type: 'spring',
                stiffness: 320,
                damping: 28,
                mass: 0.7,
              }}
            >
              <Image
                alt={title}
                src={coverImage}
                width={600}
                height={360}
                className={clsx('w-full object-cover', small ? 'h-40 md:h-48' : 'h-48 md:h-60')}
              />
            </motion.div>

            {/* Image overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent" />
          </div>
        </Link>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col p-5">
        <h3 className="mb-2 bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] bg-clip-text text-lg font-semibold tracking-tight text-transparent">
          <Link href={href}>{title}</Link>
        </h3>

        {/* Summary (clamped) */}
        <p className="text-text-secondary dark:text-text-secondary-dark [display:-webkit-box] overflow-hidden text-sm leading-relaxed [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
          {summary}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-white/20 px-2 py-0.5 text-xs backdrop-blur-sm"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.article>
  )
}
