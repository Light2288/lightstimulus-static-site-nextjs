'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import clsx from 'clsx'
import { useRef, useEffect, useMemo } from 'react'

/**
 * Configuration: words & sentences to highlight (first occurrence only)
 * Keep both EN and IT targets here (component will search case-insensitively).
 */
const WORD_HIGHLIGHTS = [
  'limulus',
  'limulo',
  'vision',
  'visione',
  'light',
  'luce',
  'finding structure in complexity',
  'trovare struttura nella complessità',
]

const SENTENCE_HIGHLIGHTS = [
  // long sentence (EN / IT)
  'My work spans augmented and extended reality, computer vision, machine learning, generative-AI workflows, mobile engineering, data pipelines, and experimental interfaces.',
  'Il mio lavoro abbraccia realtà aumentata ed estesa, computer vision, machine learning, flussi di lavoro di AI generativa, ingegneria mobile, pipeline di dati e interfacce sperimentali.',

  // final sentence markers (partial match ok)
  'I treat technology as a living laboratory',
  'Considero la tecnologia un laboratorio vivente',
]

/* Utility: escape HTML for safe injection and for data-attr values */
function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

/**
 * Build non-overlapping highlight ranges on the original raw text.
 * We search case-insensitively and pick the first occurrence for each target.
 */
function buildHighlightRanges(raw: string) {
  const lower = raw.toLowerCase()
  const ranges: Array<{ start: number; end: number; text: string }> = []

  // helper to check overlap
  const overlaps = (s: number, e: number) => ranges.some((r) => !(e <= r.start || s >= r.end))

  // add sentence ranges first (exact substring)
  for (const sentence of SENTENCE_HIGHLIGHTS) {
    if (!sentence) continue
    const idx = lower.indexOf(sentence.toLowerCase())
    if (idx !== -1) {
      const start = idx
      const end = idx + sentence.length
      if (!overlaps(start, end)) {
        ranges.push({ start, end, text: raw.slice(start, end) })
      }
    }
  }

  // then add word ranges (word boundary)
  for (const word of WORD_HIGHLIGHTS) {
    if (!word) continue
    const wLower = word.toLowerCase()
    // find first match of whole word in lower (walk with regex)
    const regex = new RegExp(`\\b${wLower.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`, 'i')
    const m = regex.exec(lower)
    if (m?.index != null) {
      const start = m.index
      const end = start + m[0].length
      if (!overlaps(start, end)) {
        ranges.push({ start, end, text: raw.slice(start, end) })
      }
    }
  }

  // normalize and sort
  ranges.sort((a, b) => a.start - b.start)
  return ranges
}

/**
 * Build final HTML by slicing raw text and wrapping ranges with span.highlight-word
 * Data attribute contains escaped original text for use by ::after (masking).
 */
function buildHighlightedHtml(raw: string) {
  const ranges = buildHighlightRanges(raw)
  if (ranges.length === 0) {
    return escapeHtml(raw)
      .split('\n')
      .map((line) => `<p>${line}</p>`)
      .join('')
  }

  let out = ''
  let pos = 0
  for (const r of ranges) {
    if (pos < r.start) {
      out += escapeHtml(raw.slice(pos, r.start))
    }
    const original = raw.slice(r.start, r.end)
    const escaped = escapeHtml(original)
    // data-text attribute must be escaped and not contain double quotes unescaped
    const dataAttr = escaped.replaceAll('"', '&quot;')
    out += `<span class="highlight-word" data-text="${dataAttr}">${escaped}</span>`
    pos = r.end
  }
  if (pos < raw.length) {
    out += escapeHtml(raw.slice(pos))
  }

  // now convert newlines to paragraphs; we want single blank line between section1 and section2
  // keep single \n\n behavior: preserve blank line as paragraph separator
  // We'll split by '\n' and wrap each line into <p>, preserving the original blank-line structure.
  // To maintain exact spacing as your locales (which use \n\n between sections), we convert raw newlines in the composed string.
  // But because we already escaped and merged the spans, we must apply line split on the original raw with markers.
  // Simplest: convert raw->lines and replace occurrences in order.
  // We'll reuse the constructed out but split by '\n' and wrap each segment in <p>.
  // NOTE: out contains HTML entities and spans; splitting on original raw's '\n' positions is tricky.
  // Simpler: split the original raw by '\n', and map through rebuild with ranges mapping - but we already built 'out' with no paragraph tags.
  // For correctness and simplicity: wrap whole out into paragraphs by replacing '\n' in the original raw with a placeholder in the escaped text.
  // Instead, we can operate by splitting the original raw into lines and rebuilding line by line using the same range logic. To keep code concise we do a quick approach:
  const finalHtml = out
    .split('\n')
    .map((line) => `<p>${line}</p>`)
    .join('')
  return finalHtml
}

export default function FixedAnalogyParagraph() {
  const { t } = useLanguage()
  const rawText = t('hero.fixed_paragraph')

  // memoize to avoid rebuilding listeners when not needed
  const html = useMemo(() => buildHighlightedHtml(rawText), [rawText])

  // background ripple container
  const rippleRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = rippleRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--ripple-x', `${e.clientX - rect.left}px`)
    el.style.setProperty('--ripple-y', `${e.clientY - rect.top}px`)
  }
  const handleMouseEnter = () => rippleRef.current?.classList.add('is-active')
  const handleMouseLeave = () => rippleRef.current?.classList.remove('is-active')

  /* per-word listeners: run each time html (locale) changes; cleanup previous listeners */
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('.highlight-word')) as HTMLElement[]

    // store attached listeners so we can remove them on cleanup
    const disposers: Array<() => void> = []

    nodes.forEach((el) => {
      // ensure data-text exists and matches content (some locales include quotes)
      if (!el.getAttribute('data-text')) {
        const text = el.textContent ?? ''
        el.setAttribute('data-text', text.replaceAll('"', '&quot;'))
      }

      const onMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        el.style.setProperty('--cursor-x', `${x}px`)
        el.style.setProperty('--cursor-y', `${y}px`)
      }
      const onEnter = () => el.classList.add('is-hovered')
      const onLeave = () => el.classList.remove('is-hovered')

      el.addEventListener('mousemove', onMove)
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)

      disposers.push(() => {
        el.removeEventListener('mousemove', onMove)
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
    })

    return () => {
      disposers.forEach((d) => d())
    }
  }, [html])

  return (
    <section
      className={clsx(
        'fixed-analogy-container',
        'mx-auto mt-16 max-w-3xl px-6 text-center',
        'text-base leading-relaxed sm:text-lg',
        'text-text-secondary dark:text-text-secondary-dark'
      )}
    >
      <div
        ref={rippleRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="glass-ripple rounded-xl bg-white/20 px-6 py-8 shadow-sm backdrop-blur-lg dark:bg-white/5"
      >
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </section>
  )
}
