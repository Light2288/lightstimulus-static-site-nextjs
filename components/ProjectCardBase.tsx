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
  small?: boolean
}

export default function ProjectCardBase({ href, title, summary, coverImage, small }: Props) {
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
        stiffness: 260, // ↓ less stiff
        damping: 26, // ↑ smoother settle
        mass: 0.8, // ↑ more weight
      }}
      className={clsx(
        'group relative overflow-hidden rounded-xl',
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
      <div className="relative z-10 p-5">
        <h3 className="mb-2 bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] bg-clip-text text-lg font-semibold tracking-tight text-transparent">
          <Link href={href}>{title}</Link>
        </h3>

        <p className="text-text-secondary dark:text-text-secondary-dark text-sm leading-relaxed">
          {summary}
        </p>
      </div>
    </motion.article>
  )
}
