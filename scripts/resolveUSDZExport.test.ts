import { describe, expect, it } from 'vitest'
import { JSDOM } from 'jsdom'
import { resolveUSDZExport } from './resolve-usdz-export.mjs'

const streamed = `<html><body><main><!--$?--><template id="B:0"></template><p>Loading</p><!--/$--></main><div hidden id="S:0"><img alt="Static preview" src="/static/images/projects/usdz-validator-demo/poster.png"><details><summary>Report</summary>Saved evidence</details><a download href="/static/model.usdz">Download</a></div><script>$RC("B:0","S:0")</script><script>self.__next_f.push([1,"unchanged flight data"])</script></body></html>`

describe('USDZ static export completion', () => {
  it('resolves the completed stream into its original boundary for no-JavaScript readers', () => {
    const result = resolveUSDZExport(streamed)
    const document = new JSDOM(result).window.document
    expect(document.querySelector('main img')?.getAttribute('alt')).toBe('Static preview')
    expect(document.querySelector('main details')?.textContent).toContain('Saved evidence')
    expect(document.querySelector('main a[download]')).not.toBeNull()
    expect(document.querySelector('main')?.textContent).not.toContain('Loading')
    expect(document.querySelector('#S\\:0')).toBeNull()
    expect(document.querySelector('main')?.innerHTML).toContain('<!--$-->')
    expect(result).toContain('self.__next_f.push([1,"unchanged flight data"])')
  })
  it('leaves an already completed export unchanged', () => {
    const resolved = '<html><body><main><!--$--><p>Ready</p><!--/$--></main></body></html>'
    expect(resolveUSDZExport(resolved)).toBe(resolved)
  })
  it('retains nested completed boundaries when replacing the outer fallback', () => {
    const html = streamed.replace('<p>Loading</p>', '<!--$--><p>Nested fallback</p><!--/$-->')
    expect(
      new JSDOM(resolveUSDZExport(html)).window.document.querySelector('main img')
    ).not.toBeNull()
  })
  it('rejects missing segments rather than publishing an invisible demonstration', () => {
    expect(() => resolveUSDZExport(streamed.replace('id="S:0"', 'id="missing"'))).toThrow(/segment/)
  })
  it('rejects a changed stream format that would leave the poster hidden', () => {
    expect(() => resolveUSDZExport(streamed.replaceAll('B:0', 'X:0'))).toThrow(/hidden/)
  })
  it('rejects an unrecognized pending boundary rather than guessing', () => {
    expect(() =>
      resolveUSDZExport(streamed.replace('$RC("B:0","S:0")', 'unknownReveal()'))
    ).toThrow(/pending/)
  })
})
