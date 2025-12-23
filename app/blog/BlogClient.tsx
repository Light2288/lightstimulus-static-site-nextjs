'use client'

import ListLayoutWithTags from '@/layouts/ListLayoutWithTags'
import type { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'

const POSTS_PER_PAGE = 5

export default function BlogClient({ posts }: { posts: CoreContent<Blog>[] }) {
  const pageNumber = 1
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)

  return (
    <ListLayoutWithTags
      posts={posts}
      initialDisplayPosts={posts.slice(0, POSTS_PER_PAGE * pageNumber)}
      pagination={{
        currentPage: pageNumber,
        totalPages,
      }}
      title="All Posts"
    />
  )
}
