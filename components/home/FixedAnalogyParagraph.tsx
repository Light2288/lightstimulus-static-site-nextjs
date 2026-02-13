'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import clsx from 'clsx'
import { useRef, useEffect, useMemo } from 'react'

/**
 * FixedAnalogyParagraph component
 *
 * Displays text with interactive highlighted words and sentences that respond to mouse hover.
 * Features a glass morphism background with ripple effect that follows the cursor.
 *
 * Key features:
 * - Highlights specific words and sentences configured in WORD_HIGHLIGHTS and SENTENCE_HIGHLIGHTS
 * - On hover, highlighted text reveals with a gradient mask effect
 * - Background ripple effect follows cursor position across the entire container
 * - Uses CSS custom properties (--ripple-x, --ripple-y, --cursor-x, --cursor-y) for smooth animations
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
  'My work spans augmented and extended reality, computer vision, machine learning, generative-AI workflows, mobile engineering, data pipelines, and experimental interfaces.',
  'Il mio lavoro abbraccia realtà aumentata ed estesa, computer vision, machine learning, flussi di lavoro di AI generativa, ingegneria mobile, pipeline di dati e interfacce sperimentali.',
  'I treat technology as a living laboratory',
  'Considero la tecnologia un laboratorio vivente',
]

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

/* Build non-overlapping highlight ranges and produce final HTML */
function buildHighlightRanges(raw: string) {
  const lower = raw.toLowerCase()
  const ranges: Array<{ start: number; end: number; text: string }> = []

  const overlaps = (s: number, e: number) => ranges.some((r) => !(e <= r.start || s >= r.end))

  // sentences first
  for (const sentence of SENTENCE_HIGHLIGHTS) {
    const idx = lower.indexOf(sentence.toLowerCase())
    if (idx !== -1) {
      const start = idx
      const end = idx + sentence.length
      if (!overlaps(start, end)) ranges.push({ start, end, text: raw.slice(start, end) })
    }
  }

  // then single words with whole-word regex
  for (const word of WORD_HIGHLIGHTS) {
    const wLower = word.toLowerCase()
    const regex = new RegExp(`\\b${wLower.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`, 'i')
    const m = regex.exec(lower)
    if (m?.index != null) {
      const start = m.index
      const end = start + m[0].length
      if (!overlaps(start, end)) ranges.push({ start, end, text: raw.slice(start, end) })
    }
  }

  ranges.sort((a, b) => a.start - b.start)
  return ranges
}

/* Build html using single pass (avoids nested replacements) */
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
    const dataAttr = escaped.replaceAll('"', '&quot;')
    out += `<span class="highlight-word" data-text="${dataAttr}">${escaped}</span>`
    pos = r.end
  }
  if (pos < raw.length) out += escapeHtml(raw.slice(pos))

  // convert newlines into separate paragraphs (preserving single blank line between parts)
  const finalHtml = out
    .split('\n')
    .map((line) => `<p>${line}</p>`)
    .join('')

  return finalHtml
}

export default function FixedAnalogyParagraph() {
  const { t } = useLanguage()
  const rawText = t('hero.fixed_paragraph')

  const html = useMemo(() => buildHighlightedHtml(rawText), [rawText])

  const containerRef = useRef<HTMLDivElement | null>(null)

  /* Container handlers: update ripple coords and opacity (for whole background) */
  const handleContainerMouseMove = (e: React.MouseEvent) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--ripple-x', `${e.clientX - rect.left}px`)
    el.style.setProperty('--ripple-y', `${e.clientY - rect.top}px`)
    el.style.setProperty('--ripple-opacity', '1')
  }
  const handleContainerMouseLeave = () => {
    const el = containerRef.current
    if (!el) return
    el.style.setProperty('--ripple-opacity', '0')
  }

  /* Per-word listeners: attach after html changes; they update both the word mask vars and container ripple */
  useEffect(() => {
    const elContainer = containerRef.current
    const nodes = Array.from(document.querySelectorAll('.highlight-word')) as HTMLElement[]
    const disposers: Array<() => void> = []

    nodes.forEach((el) => {
      // ensure data-text exists
      if (!el.getAttribute('data-text')) {
        const text = el.textContent || ''
        el.setAttribute('data-text', text.replaceAll('"', '&quot;'))
      }

      const onMove = (ev: MouseEvent) => {
        const rect = el.getBoundingClientRect()
        const x = ev.clientX - rect.left
        const y = ev.clientY - rect.top
        el.style.setProperty('--cursor-x', `${x}px`)
        el.style.setProperty('--cursor-y', `${y}px`)

        // ALSO update container ripple so background follows even over the span
        if (elContainer) {
          const crect = elContainer.getBoundingClientRect()
          elContainer.style.setProperty('--ripple-x', `${ev.clientX - crect.left}px`)
          elContainer.style.setProperty('--ripple-y', `${ev.clientY - crect.top}px`)
          elContainer.style.setProperty('--ripple-opacity', '1')
        }
      }

      const onEnter = () => {
        el.classList.add('is-hovered')
        if (elContainer) elContainer.style.setProperty('--ripple-opacity', '1')
      }
      const onLeave = () => {
        el.classList.remove('is-hovered')
        if (elContainer) elContainer.style.setProperty('--ripple-opacity', '0')
      }

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
        'mx-auto mt-6 max-w-5xl px-6 text-center' /* increased width */,
        'text-base leading-relaxed sm:text-lg',
        'text-text-secondary dark:text-text-secondary-dark'
      )}
    >
      <div
        ref={containerRef}
        onMouseMove={handleContainerMouseMove}
        onMouseLeave={handleContainerMouseLeave}
        className="glass-ripple rounded-xl bg-white/20 px-6 py-6 shadow-sm backdrop-blur-lg dark:bg-white/5"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  )
}
