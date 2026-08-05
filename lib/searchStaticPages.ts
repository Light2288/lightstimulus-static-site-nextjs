export type Localized = { en: string; it: string }

export type StaticSearchPage = {
  url: string
  type: 'Page'
  title: Localized
  summary: Localized
}

/**
 * Hand-authored search entries for static routes that have no MDX source.
 * Plain data only (no contentlayer imports) so it can be imported safely
 * at build time by the search index generator.
 */
export const staticSearchPages: StaticSearchPage[] = [
  {
    url: '/contact',
    type: 'Page',
    title: { en: 'Contact', it: 'Contatti' },
    summary: {
      en: 'Get in touch to discuss technology, systems, and innovative ideas.',
      it: 'Mettiti in contatto per parlare di tecnologia, sistemi e idee innovative.',
    },
  },
  {
    url: '/projects',
    type: 'Page',
    title: { en: 'Projects', it: 'Progetti' },
    summary: {
      en: 'Portfolio of projects across AR/XR, AI, computer vision, and experimental interfaces.',
      it: 'Portfolio di progetti su AR/XR, AI, computer vision e interfacce sperimentali.',
    },
  },
  {
    url: '/blog',
    type: 'Page',
    title: { en: 'Blog', it: 'Blog' },
    summary: {
      en: 'Articles and notes on code, experiments, and the ideas behind the projects.',
      it: 'Articoli e note su codice, esperimenti e le idee dietro i progetti.',
    },
  },
]
