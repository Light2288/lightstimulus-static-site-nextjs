'use client'

import Link from '@/components/Link'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Project } from 'contentlayer/generated'
import { useLanguage } from '@/contexts/LanguageContext'

import { Globe, MonitorPlay, FileText, GraduationCap, BookOpen, Video } from 'lucide-react'

import { SiGithub, SiFigma, SiNpm } from '@icons-pack/react-simple-icons'

interface ProjectLinksProps {
  project: CoreContent<Project>
}

const ICON_MAP: Record<string, React.ElementType> = {
  github: SiGithub,
  demo: MonitorPlay,
  website: Globe,
  article: FileText,
  paper: GraduationCap,
  docs: BookOpen,
  video: Video,
  npm: SiNpm,
  figma: SiFigma,
}

export default function ProjectLinks({ project }: ProjectLinksProps) {
  const { t } = useLanguage()
  const links = project.links

  if (!links) return null

  const entries = Object.entries(links).filter(
    (entry): entry is [string, string] =>
      typeof entry[1] === 'string' && entry[1].length > 0 && entry[0] in ICON_MAP
  )

  if (entries.length === 0) return null

  return (
    <ul className="space-y-3 text-sm">
      {entries.map(([key, href]) => {
        const Icon = ICON_MAP[key]

        return (
          <li key={key}>
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200 flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              <span>{t(`projects.links.${key}`)}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
