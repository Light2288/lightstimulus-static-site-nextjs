import { describe, it, expect } from 'vitest'
import robots from './robots'
import siteMetadata from '@/data/siteMetadata'

/** Characterisation tests for the static robots.txt route. */
describe('robots', () => {
  it('allows all user agents on every path', () => {
    expect(robots().rules).toEqual({ userAgent: '*', allow: '/' })
  })

  it('points at the sitemap under the configured site url', () => {
    expect(robots().sitemap).toBe(`${siteMetadata.siteUrl}/sitemap.xml`)
  })

  it('reports the configured site url as host', () => {
    expect(robots().host).toBe(siteMetadata.siteUrl)
  })

  it('is deterministic across calls', () => {
    expect(robots()).toEqual(robots())
  })
})
