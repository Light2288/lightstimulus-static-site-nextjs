import Hero from '@/components/home/hero/Hero'
import Taglines from '@/components/home/Taglines'
import FixedAnalogyParagraph from '@/components/home/FixedAnalogyParagraph'
import ProjectsPreview from '@/components/home/ProjectsPreview'
import BlogPreview from '@/components/home/BlogPreview'

export default async function Page() {
  return (
    <>
      <Hero />
      <Taglines />
      <FixedAnalogyParagraph />

      <ProjectsPreview />
      <BlogPreview />
    </>
  )
}
