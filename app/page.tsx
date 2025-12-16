import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import Main from './Main'
import Hero from '@/components/home/hero/Hero'
import Taglines from '@/components/home/Taglines'
import FixedAnalogyParagraph from '@/components/home/FixedAnalogyParagraph'
import ProjectsPreview from '@/components/home/ProjectsPreview'

export default async function Page() {
  const sortedPosts = sortPosts(allBlogs)
  const posts = allCoreContent(sortedPosts)

  return (
    <>
      <Hero />
      <Taglines />
      <FixedAnalogyParagraph />

      <ProjectsPreview />

      <Main posts={posts} />
    </>
  )
}
