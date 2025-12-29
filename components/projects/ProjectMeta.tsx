// components/projects/ProjectMeta.tsx

import { CoreContent } from 'pliny/utils/contentlayer'
import type { Project } from 'contentlayer/generated'
import ProjectLinks from './ProjectLinks'

interface ProjectMetaProps {
  project: CoreContent<Project>
}

export default function ProjectMeta({ project }: ProjectMetaProps) {
  return (
    <div className="glass-bg space-y-6 rounded-2xl p-6">
      {/* Stack */}
      {project.stack && project.stack.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
            Stack
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {project.stack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Links */}
      <ProjectLinks project={project} />

      {/* Date */}
      {project.date && (
        <div>
          <h3 className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
            Date
          </h3>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            {new Date(project.date).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  )
}
