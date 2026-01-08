import { allBlogs } from 'contentlayer/generated'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { genPageMetadata } from 'app/seo'
import BlogListClient from '@/components/blog/BlogListClient'
import { Suspense } from 'react'

const POSTS_PER_PAGE = 5

export const metadata = genPageMetadata({ title: 'Blog' })

export default function BlogPage() {
  const allPosts = allCoreContent(sortPosts(allBlogs))

  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE)
  const pagePosts = allPosts.slice(0, POSTS_PER_PAGE)

  return (
    <Suspense fallback={null}>
      <BlogListClient
        posts={pagePosts}
        allPosts={allPosts}
        totalPages={totalPages}
        currentPage={1}
      />
    </Suspense>
  )
}
