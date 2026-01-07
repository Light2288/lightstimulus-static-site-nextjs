import { allBlogs } from 'contentlayer/generated'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { notFound } from 'next/navigation'
import BlogListClient from '@/components/blog/BlogListClient'

const POSTS_PER_PAGE = 5

export const generateStaticParams = async () => {
  const totalPages = Math.ceil(allBlogs.length / POSTS_PER_PAGE)
  return Array.from({ length: totalPages }, (_, i) => ({
    page: String(i + 1),
  }))
}

export default async function BlogPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params
  const pageNumber = Number(page)

  if (Number.isNaN(pageNumber) || pageNumber < 1) return notFound()

  const allPosts = allCoreContent(sortPosts(allBlogs))
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE)

  if (pageNumber > totalPages) return notFound()

  const pagePosts = allPosts.slice(POSTS_PER_PAGE * (pageNumber - 1), POSTS_PER_PAGE * pageNumber)

  return (
    <BlogListClient
      posts={pagePosts}
      allPosts={allPosts}
      totalPages={totalPages}
      currentPage={pageNumber}
    />
  )
}
