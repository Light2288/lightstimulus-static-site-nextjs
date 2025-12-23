export interface Project {
  title: {
    en: string
    it: string
  }
  summary: {
    en: string
    it: string
  }
  date: string
  tags: string[]

  projectType?: 'research' | 'experiment' | 'product'
  status?: 'concept' | 'in-progress' | 'completed'

  stack: string[]

  links?: {
    github?: string
    demo?: string
    website?: string
    [key: string]: string | undefined
  }

  coverImage?: string
  github?: string
  demo?: string

  slug: string
  path: string
  filePath: string

  readingTime: {
    text: string
    minutes: number
    time: number
    words: number
  }

  toc: TocItem[]
}
