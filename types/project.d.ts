export interface TocItem {
  value: string
  url: string
  depth: number
}

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
  coverImage?: string
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
