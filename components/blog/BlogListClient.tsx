'use client'

import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import ListWithTagsLayout from '@/layouts/ListWithTagsLayout'
import tagData from 'app/blog-tag-data.json'
import { useLanguage } from '@/contexts/LanguageContext'
import Link from '@/components/Link'
import Tag from '@/components/Tag'

interface Props {
  posts: CoreContent<Blog>[]
  allPosts: CoreContent<Blog>[]
  totalPages: number
  currentPage: number
}

export default function BlogListClient({ posts, allPosts, totalPages, currentPage }: Props) {
  const { t, lang } = useLanguage()

  return (
    <ListWithTagsLayout
      items={posts}
      allItems={allPosts}
      tagData={tagData}
      title={t('blog.title')}
      pagination={{ currentPage, totalPages }}
      description={t('blog.description')}
      getItemTags={(post) => post.tags}
      renderItem={(post) => (
        <article
          key={post.slug}
          className="hover:border-primary-500/30 hover:bg-primary-500/5 rounded-lg border border-transparent p-4 transition-colors"
        >
          <time dateTime={post.date} className="text-text-secondary text-sm">
            {new Intl.DateTimeFormat(lang, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }).format(new Date(post.date))}
          </time>

          <h2 className="mt-2 text-2xl font-bold">
            <Link
              href={`/${post.path}`}
              className="bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] bg-clip-text text-transparent"
            >
              {lang === 'it' ? post.titleIt : post.titleEn}
            </Link>
          </h2>

          <div className="mt-2 flex flex-wrap gap-2">
            {post.tags?.map((tag) => (
              <Tag key={tag.id} tag={tag} />
            ))}
          </div>

          <p className="text-text-secondary mt-3">
            {lang === 'it' ? post.summaryIt : post.summaryEn}
          </p>
        </article>
      )}
    />
  )
}
