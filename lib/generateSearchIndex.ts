import { writeFileSync } from 'fs'
import path from 'path'
import siteMetadata from '../data/siteMetadata'
import { staticSearchPages } from './searchStaticPages'

type Locale = 'en' | 'it'

type Localized = { en?: string; it?: string } | undefined

export type SearchEntry = {
  id: string
  title: string
  summary: string
  type: 'Blog' | 'Project' | 'Page'
  url: string
  lang: Locale
}

const LOCALES: Locale[] = ['en', 'it']

/**
 * Resolve a localized `{ en, it }` field for a given locale, falling back
 * to the other language when the requested one is missing so entries never
 * carry an empty title/summary.
 */
function localize(field: Localized, locale: Locale): string {
  if (!field) return ''
  const other: Locale = locale === 'en' ? 'it' : 'en'
  return field[locale] ?? field[other] ?? ''
}

/**
 * Push one entry per locale (en + it) for a single piece of content. Both
 * entries share the same URL because there are no language-specific routes.
 */
function emitLocalized(
  entries: SearchEntry[],
  {
    title,
    summary,
    url,
    type,
  }: { title: Localized; summary: Localized; url: string; type: SearchEntry['type'] }
) {
  for (const locale of LOCALES) {
    entries.push({
      id: `${url}#${locale}`,
      title: localize(title, locale),
      summary: localize(summary, locale),
      type,
      url,
      lang: locale,
    })
  }
}

/**
 * Build the expanded, per-language, multi-type search index and write it to
 * `public/<searchDocumentsPath>`. Covers blog posts, projects, the about
 * page, and hand-authored static pages. Drafts are excluded.
 */
export async function createSearchIndex(allBlogs, allProjects, authors) {
  if (
    siteMetadata?.search?.provider !== 'kbar' ||
    !siteMetadata.search.kbarConfig.searchDocumentsPath
  ) {
    return
  }

  const entries: SearchEntry[] = []

  // Blog posts -> /<path> (path is `blog/<slug>`), skip drafts.
  for (const post of allBlogs) {
    if (post.draft === true) continue
    emitLocalized(entries, {
      title: post.title,
      summary: post.summary,
      url: `/${post.path}`,
      type: 'Blog',
    })
  }

  // Projects -> /projects/<slug>, skip drafts.
  for (const project of allProjects) {
    if (project.draft === true) continue
    emitLocalized(entries, {
      title: project.title,
      summary: project.summary,
      url: `/projects/${project.slug}`,
      type: 'Project',
    })
  }

  // About page -> /about (author has no localized title; use name + a
  // localized description derived from occupation/company).
  const author = authors?.find((a) => a.slug === 'default') ?? authors?.[0]
  if (author) {
    const role = [author.occupation, author.company].filter(Boolean).join(' · ')
    emitLocalized(entries, {
      title: { en: author.name, it: author.name },
      summary: {
        en: role ? `About ${author.name} — ${role}` : `About ${author.name}`,
        it: role ? `Chi è ${author.name} — ${role}` : `Chi è ${author.name}`,
      },
      url: '/about',
      type: 'Page',
    })
  }

  // Hand-authored static pages.
  for (const page of staticSearchPages) {
    emitLocalized(entries, {
      title: page.title,
      summary: page.summary,
      url: page.url,
      type: page.type,
    })
  }

  writeFileSync(
    `public/${path.basename(siteMetadata.search.kbarConfig.searchDocumentsPath)}`,
    JSON.stringify(entries)
  )
  console.log('Local search index generated...')
}
