import Image from '@/components/Image'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import BlogPostHeaderClient from '@/components/blog/BlogPostHeaderClient'
import BlogPostNavigationClient from '@/components/blog/BlogPostNavigationClient'
import { ReactNode } from 'react'
import { Blog } from 'contentlayer/generated'
import { CoreContent } from 'pliny/utils/contentlayer'

interface BlogPostLayoutProps {
  content: CoreContent<Blog>
  next?: CoreContent<Blog>
  prev?: CoreContent<Blog>
  children: ReactNode
}

export default function BlogPostLayout({ content, next, prev, children }: BlogPostLayoutProps) {
  const { images } = content

  // Get title for alt text (use English as fallback since this is server-side)
  const title = content.title?.en || 'Blog post'

  return (
    <>
      <ScrollTopAndComment />
      <article className="mx-auto max-w-5xl px-4 py-16">
        {/* Hero */}
        <header className="space-y-10">
          {images?.[0] && (
            <div className="glass-bg relative aspect-[16/9] overflow-hidden rounded-2xl">
              <Image
                src={images[0]}
                alt={title}
                fill
                className="object-cover"
                priority
                fetchpriority="high"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                quality={85}
                loading="eager"
              />
            </div>
          )}

          <BlogPostHeaderClient content={content} />
        </header>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert mx-auto mt-16">{children}</div>

        {/* Navigation - after content */}
        <BlogPostNavigationClient next={next} prev={prev} />
      </article>
    </>
  )
}
