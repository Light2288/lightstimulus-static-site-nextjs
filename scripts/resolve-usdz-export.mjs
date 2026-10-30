import { readFile, writeFile } from 'node:fs/promises'
import { JSDOM } from 'jsdom'

// Next 15 can export completed Suspense content in hidden stream segments.
// Resolve only this demonstration page at build time so its existing content
// also works without the JavaScript that normally reveals those segments.
export function resolveUSDZExport(html) {
  const dom = new JSDOM(html)
  try {
    const { document } = dom.window
    const reveals = [...html.matchAll(/\$RC\("(B:[^"]+)","(S:[^"]+)"\)/g)]
    for (const [, boundaryId, segmentId] of reveals) {
      const boundary = document.getElementById(boundaryId)
      const segment = document.getElementById(segmentId)
      const start = boundary?.previousSibling
      if (!boundary || !segment || start?.nodeType !== 8 || start.data !== '$?') {
        throw new Error(`Unexpected USDZ export boundary/segment: ${boundaryId}, ${segmentId}`)
      }
      let end = boundary.nextSibling
      let depth = 0
      while (end) {
        if (end.nodeType === 8) {
          if (end.data === '/$') {
            if (depth === 0) break
            depth -= 1
          } else if (['$', '$?', '$!'].includes(end.data)) depth += 1
        }
        end = end.nextSibling
      }
      if (!end) throw new Error(`Unterminated USDZ export boundary: ${boundaryId}`)
      let fallback = boundary
      while (fallback !== end) {
        const next = fallback.nextSibling
        fallback.remove()
        fallback = next
      }
      end.before(...segment.childNodes)
      start.data = '$'
      segment.remove()
    }
    if (document.querySelector('template[id^="B:"]')) {
      throw new Error('Unrecognized pending USDZ export boundary; review the Next stream format')
    }
    const poster = document.querySelector('img[src*="/usdz-validator-demo/poster.png"]')
    if (poster?.closest('[hidden]')) {
      throw new Error('USDZ export poster remains hidden; review the Next stream format')
    }
    return reveals.length ? dom.serialize() : html
  } finally {
    dom.window.close()
  }
}

export default async function completeUSDZExport() {
  const file = 'out/projects/usdz-validator.html'
  const html = await readFile(file, 'utf8')
  const resolved = resolveUSDZExport(html)
  if (resolved !== html) await writeFile(file, resolved)
  console.log('USDZ demonstration static HTML completed for no-JavaScript access')
}
