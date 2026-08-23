import { describe, it, expect } from 'vitest'
import { components } from './MDXComponents'

/**
 * The MDX component map is data, not markup: it decides which React
 * components back the custom and overridden tags used in `.mdx` content.
 * These tests pin its shape so a rename cannot silently drop a mapping.
 */
describe('MDXComponents', () => {
  it('exposes the custom components used in MDX content', () => {
    expect(components).toHaveProperty('Image')
    expect(components).toHaveProperty('TOCInline')
    expect(components).toHaveProperty('Lang')
  })

  it('overrides the html tags that need custom rendering', () => {
    expect(components).toHaveProperty('a')
    expect(components).toHaveProperty('pre')
    expect(components).toHaveProperty('table')
  })

  it('maps every key to a renderable component', () => {
    for (const [name, component] of Object.entries(components)) {
      expect(['function', 'object'], `components.${name}`).toContain(typeof component)
      expect(component, `components.${name}`).toBeTruthy()
    }
  })

  it('declares exactly the expected set of mappings', () => {
    expect(Object.keys(components).sort()).toEqual(
      ['Image', 'Lang', 'TOCInline', 'a', 'pre', 'table'].sort()
    )
  })
})
