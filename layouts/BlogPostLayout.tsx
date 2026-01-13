'use client'

import Image from '@/components/Image'
import PageTitle from '@/components/PageTitle'
import Tag from '@/components/Tag'
import Link from '@/components/Link'
import { useLanguage } from '@/contexts/LanguageContext'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'

export default function BlogPostLayout({ content, next, prev, children }) {
  const { date, tags, images, readingTime } = content

  const { lang, t } = useLanguage()

  const title = content.title?.[lang] ?? content.title?.en
  const summary = content.summary?.[lang] ?? content.summary?.en

  return (
    <>
      <ScrollTopAndComment />
      <article className="mx-auto max-w-5xl px-4 py-16">
        {/* Hero */}
        <header className="space-y-10">
          {images?.[0] && (
            <div className="glass-bg relative aspect-[16/9] overflow-hidden rounded-2xl">
              <Image src={images[0]} alt={title} fill className="object-cover" priority />
            </div>
          )}

          <div className="space-y-6 text-center">
            <PageTitle gradient>{title}</PageTitle>

            {summary && (
              <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                {summary}
              </p>
            )}
          </div>

          <div className="flex flex-col items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex gap-4">
              <time dateTime={date}>{new Date(date).toLocaleDateString(lang)}</time>
              {readingTime && (
                <span>{t('blog.reading_time', { minutes: Math.ceil(readingTime.minutes) })}</span>
              )}
            </div>

            {tags?.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {tags.map((tag) => (
                  <Tag key={tag.id} tag={tag} />
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert mx-auto mt-16">{children}</div>

        {/* Navigation */}
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
      </article>
    </>
  )
}
