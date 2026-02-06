'use client'

import Link from '@/components/Link'
import SectionHeader from '@/components/common/SectionHeader'
import BlogCardSmall from '@/components/blog/BlogCardSmall'
import { useLanguage } from '@/contexts/LanguageContext'
import { CoreContent } from 'pliny/utils/contentlayer'
import { Blog } from 'contentlayer/generated'

interface BlogPreviewProps {
  posts: CoreContent<Blog>[]
}

export default function BlogPreview({ posts }: BlogPreviewProps) {
  const { lang, t } = useLanguage()

  if (!posts.length) return null

  return (
    <section className="mx-auto mt-12 max-w-6xl px-6">
      <div className="mb-6 flex items-center justify-between">
        <SectionHeader labelKey="home.blog.title" />
        <Link
          href="/blog"
          className="text-accent-primary hover:text-accent-secondary text-sm transition"
        >
          {t('home.blog.view_all')} →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCardSmall
            key={post.slug}
            slug={post.slug}
            date={post.date}
            title={post.title[lang] ?? post.title.en}
            summary={post.summary[lang] ?? post.summary.en}
            tags={post.tags ?? []}
          />
        ))}
      </div>
    </section>
  )
}
