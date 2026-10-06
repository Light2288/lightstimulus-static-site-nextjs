export type LocalizedPortraitText = {
  en: string
  it: string
}

export type PortraitVariant = {
  id: string
  label: LocalizedPortraitText
  src: string
}

export type Portrait = {
  id: string
  title: LocalizedPortraitText
  original: string
  focalPoint: string
  variants: PortraitVariant[]
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const normalizeText = (value: unknown): LocalizedPortraitText | null => {
  if (!isRecord(value) || !isNonEmptyString(value.en) || !isNonEmptyString(value.it)) {
    return null
  }

  return { en: value.en, it: value.it }
}

const normalizeVariant = (value: unknown): PortraitVariant | null => {
  if (!isRecord(value) || !isNonEmptyString(value.id) || !isNonEmptyString(value.src)) {
    return null
  }

  const label = normalizeText(value.label)
  if (!label) return null

  return { id: value.id, label, src: value.src }
}

export function normalizePortraits(value: unknown): Portrait[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((candidate): Portrait[] => {
    if (
      !isRecord(candidate) ||
      !isNonEmptyString(candidate.id) ||
      !isNonEmptyString(candidate.original)
    ) {
      return []
    }

    const title = normalizeText(candidate.title)
    if (!title) return []

    const variants = Array.isArray(candidate.variants)
      ? candidate.variants.flatMap((variant) => {
          const normalized = normalizeVariant(variant)
          return normalized ? [normalized] : []
        })
      : []

    return [
      {
        id: candidate.id,
        title,
        original: candidate.original,
        focalPoint: isNonEmptyString(candidate.focalPoint) ? candidate.focalPoint : '50% 50%',
        variants,
      },
    ]
  })
}
