import Link from '@/components/Link'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Project } from 'contentlayer/generated'

interface ProjectLinksProps {
  project: CoreContent<Project>
}

const LABEL_MAP: Record<string, string> = {
  github: 'GitHub',
  demo: 'Demo',
  website: 'Website',
}

export default function ProjectLinks({ project }: ProjectLinksProps) {
  const links = project.links

  if (!links) return null

  const entries = Object.entries(links).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].length > 0
  )

  if (entries.length === 0) return null

  return (
    <div>
      <h3 className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
        Links
      </h3>

      <ul className="mt-2 space-y-2 text-sm">
        {entries.map(([key, href]) => (
          <li key={key}>
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            >
              {LABEL_MAP[key] ?? key}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
