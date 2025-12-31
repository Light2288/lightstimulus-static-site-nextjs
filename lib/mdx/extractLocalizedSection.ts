// lib/mdx/extractLocalizedSection.ts

export type SupportedLang = 'en' | 'it' | string

interface ExtractLocalizedSectionParams {
  body: string
  lang: SupportedLang
  fallbackLang?: SupportedLang
}

/**
 * Extracts the MDX section matching the active language.
 * Sections must be defined as:
 *
 * ## [lang=en]
 * Content...
 *
 * ## [lang=it]
 * Content...
 */
export function extractLocalizedSection({
  body,
  lang,
  fallbackLang = 'en',
}: ExtractLocalizedSectionParams): string {
  if (!body) return body

  const sections = splitByLanguage(body)

  if (sections[lang]) {
    return sections[lang].trim()
  }

  if (sections[fallbackLang]) {
    return sections[fallbackLang].trim()
  }

  // Fallback: return entire body if no language blocks exist
  return body.trim()
}

function splitByLanguage(body: string): Record<string, string> {
  const result: Record<string, string> = {}

  const regex = /^##\s*\[lang=(.+?)\]\s*$/gm
  const matches = [...body.matchAll(regex)]

  // No language markers → treat entire body as default
  if (matches.length === 0) {
    return result
  }

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]
    const lang = match[1].trim()
    const start = match.index! + match[0].length
    const end = matches[i + 1]?.index ?? body.length

    const sectionContent = body
      .slice(start, end)
      .replace(/^---\s*/gm, '')
      .trim()

    result[lang] = sectionContent
  }

  return result
}
