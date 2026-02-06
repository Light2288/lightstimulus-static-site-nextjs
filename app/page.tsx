import Hero from '@/components/home/hero/Hero'
import Taglines from '@/components/home/Taglines'
import FixedAnalogyParagraph from '@/components/home/FixedAnalogyParagraph'
import ProjectsPreview from '@/components/home/ProjectsPreview'
import BlogPreview from '@/components/home/BlogPreview'
import { allBlogs, allProjects } from 'contentlayer/generated'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'

const MAX_BLOG_DISPLAY = 3
const MAX_PROJECT_DISPLAY = 4

export default async function Page() {
  // Fetch blog posts on server
  const sortedPosts = sortPosts(allBlogs)
  const corePosts = allCoreContent(sortedPosts)
  const recentPosts = corePosts.slice(0, MAX_BLOG_DISPLAY)

  // Fetch projects on server
  const sortedProjects = allProjects.sort((a, b) => +new Date(b.date) - +new Date(a.date))
  const recentProjects = sortedProjects.slice(0, MAX_PROJECT_DISPLAY)

  return (
    <>
      <Hero />
      <Taglines />
      <FixedAnalogyParagraph />

      <ProjectsPreview projects={recentProjects} />
      <BlogPreview posts={recentPosts} />
    </>
  )
}
