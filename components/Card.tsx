import Image from './Image'
import Link from './Link'
import { motion } from 'motion/react'

const Card = ({ title, description, imgSrc, href }) => {
  const Wrapper = href ? Link : 'div'

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="group relative max-w-[540px] p-4 md:w-1/2"
    >
      {/* Glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(120deg, var(--color-primary-500), var(--color-secondary-500))',
        }}
      />

      <div className="glass-bg relative h-full overflow-hidden rounded-xl border border-gray-200/40 transition-all duration-300 group-hover:border-[var(--color-primary-500)] dark:border-gray-700/40">
        {imgSrc && (
          <Wrapper href={href} aria-label={title}>
            <div className="relative overflow-hidden">
              <Image
                alt={title}
                src={imgSrc}
                width={544}
                height={306}
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              {/* Image gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent" />
            </div>
          </Wrapper>
        )}

        <div className="relative p-6">
          <h2 className="mb-3 bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] bg-clip-text text-2xl font-semibold tracking-tight text-transparent">
            {href ? <Link href={href}>{title}</Link> : title}
          </h2>

          <p className="text-text-secondary dark:text-text-secondary-dark mb-4 text-sm leading-relaxed">
            {description}
          </p>

          {href && (
            <Link
              href={href}
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary-500)] transition-colors hover:text-[var(--color-secondary-500)]"
            >
              Learn more →
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default Card
