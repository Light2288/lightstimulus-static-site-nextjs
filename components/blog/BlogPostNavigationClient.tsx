'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import Link from '@/components/Link'
import { CoreContent } from 'pliny/utils/contentlayer'
import { Blog } from 'contentlayer/generated'

interface BlogPostNavigationClientProps {
  next?: CoreContent<Blog>
  prev?: CoreContent<Blog>
}

export default function BlogPostNavigationClient({ next, prev }: BlogPostNavigationClientProps) {
  const { lang, t } = useLanguage()

  return (
    <nav className="mt-24 grid grid-cols-2 gap-8 text-sm">
      <div>
        {prev && (
          <Link href={`/blog/${prev.slug}`} className="hover:text-primary-500">
            ← {t('blog.previous_article', { prevTitle: prev.title?.[lang] ?? prev.title?.en })}
          </Link>
        )}
      </div>
      <div className="text-right">
        {next && (
          <Link href={`/blog/${next.slug}`} className="hover:text-primary-500 text-right">
            {t('blog.next_article', { nextTitle: next.title?.[lang] ?? next.title?.en })} →
          </Link>
        )}
      </div>
    </nav>
  )
}
