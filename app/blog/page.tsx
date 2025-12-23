import { Suspense } from 'react'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { genPageMetadata } from 'app/seo'
import BlogClient from './BlogClient'

export const metadata = genPageMetadata({ title: 'Blog' })

export default function BlogPage() {
  const posts = allCoreContent(sortPosts(allBlogs))

  return (
    <Suspense fallback={null}>
      <BlogClient posts={posts} />
    </Suspense>
  )
}
