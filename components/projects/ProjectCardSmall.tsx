import ProjectCardBase from '@/components/projects/ProjectCardBase'

interface Props {
  href: string
  title: string
  summary: string
  coverImage?: string
}

export default function ProjectCardSmall({ href, title, summary, coverImage }: Props) {
  return (
    <ProjectCardBase href={href} title={title} summary={summary} coverImage={coverImage} small />
  )
}
