'use client'

import Link from './Link'
import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 flex flex-col items-center border-t border-gray-200/40 bg-[var(--color-bg-light)] py-8 text-sm text-gray-600 transition-colors duration-300 dark:border-gray-700/40 dark:bg-[var(--color-bg-dark)] dark:text-gray-400">
      {/* Social Icons */}
      <div className="mb-4 flex flex-wrap justify-center gap-5">
        <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} size={6} />
        <SocialIcon kind="github" href={siteMetadata.github} size={6} />
        <SocialIcon kind="linkedin" href={siteMetadata.linkedin} size={6} />
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap justify-center gap-2 text-center text-xs sm:text-sm">
        <span>{siteMetadata.author}</span>
        <span>•</span>
        <span>© {year}</span>
        <span>•</span>
        <Link
          href="/"
          className="text-accent-secondary hover:text-accent-tertiary dark:text-accent-secondary dark:hover:text-accent-tertiary font-medium transition-colors duration-200"
        >
          {siteMetadata.title}
        </Link>
      </div>

      <div className="text-primary-500 dark:text-primary-500 animate-heartbeat mt-4 text-center text-xs transition-opacity duration-300 hover:opacity-90">
        Built with ❤️ using{' '}
        <a
          href="https://nextjs.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-secondary hover:text-accent-tertiary dark:text-accent-secondary dark:hover:text-accent-tertiary font-medium transition-colors duration-200"
        >
          Next.js
        </a>
        {', '}
        <a
          href="https://tailwindcss.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-secondary hover:text-accent-tertiary dark:text-accent-secondary dark:hover:text-accent-tertiary font-medium transition-colors duration-200"
        >
          Tailwind CSS
        </a>
        {', and '}
        <a
          href="https://www.typescriptlang.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-secondary hover:text-accent-tertiary dark:text-accent-secondary dark:hover:text-accent-tertiary font-medium transition-colors duration-200"
        >
          TypeScript
        </a>
        .
      </div>
    </footer>
  )
}
