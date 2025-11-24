import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import Main from './Main'
import Hero from '@/components/home/hero/Hero'
import Taglines from '@/components/home/Taglines'

export default async function Page() {
  const sortedPosts = sortPosts(allBlogs)
  const posts = allCoreContent(sortedPosts)
  return (
    <>
      <Hero />
      <Taglines />
      <Main posts={posts} />
    </>
  )
}
