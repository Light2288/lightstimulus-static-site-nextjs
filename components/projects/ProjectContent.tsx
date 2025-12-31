'use client'

import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { components } from '@/components/MDXComponents'

interface ProjectContentProps {
  code: string
}

export default function ProjectContent({ code }: ProjectContentProps) {
  return <MDXLayoutRenderer code={code} components={components} />
}
