import { existsSync, readFileSync } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { imageSize } from 'image-size'
import { describe, expect, it } from 'vitest'

type CertificationFrontmatter = {
  title: string
  issuer: string
  year: number
  issueDate?: string
  expiryDate?: string
  image?: string
  url?: string
}

const authorPath = path.join(process.cwd(), 'data', 'authors', 'default.mdx')
const { data } = matter(readFileSync(authorPath, 'utf8'))
const certifications: CertificationFrontmatter[] = Array.isArray(data.certifications)
  ? data.certifications
  : []

describe('About certification assets', () => {
  it('publishes the AWS Developer Associate credential', () => {
    expect(
      certifications.find(({ title }) => title === 'AWS Certified Developer – Associate')
    ).toEqual({
      title: 'AWS Certified Developer – Associate',
      issuer: 'Amazon Web Services',
      year: 2026,
      issueDate: '2026-10-09',
      expiryDate: '2029-10-09',
      image: '/static/images/certifications/aws-certified-developer-associate.png',
      url: 'https://www.credly.com/badges/af018809-9f73-4d2a-9131-6da9445fadd9/public_url',
    })
  })

  it('provides the AWS Developer Associate badge and responsive variants', () => {
    const imageDir = path.join(process.cwd(), 'public', 'static', 'images', 'certifications')
    const primary = path.join(imageDir, 'aws-certified-developer-associate.png')

    expect(existsSync(primary)).toBe(true)
    expect(imageSize(readFileSync(primary))).toMatchObject({ width: 600, height: 600, type: 'png' })

    for (const width of [144, 200] as const) {
      for (const extension of ['png', 'webp'] as const) {
        const variant = path.join(
          imageDir,
          'responsive',
          `aws-certified-developer-associate-${width}w.${extension}`
        )
        expect(existsSync(variant)).toBe(true)
        expect(imageSize(readFileSync(variant)).width).toBe(width)
      }
    }

    const largeWebp = path.join(
      imageDir,
      'responsive',
      'aws-certified-developer-associate-600w.webp'
    )
    expect(existsSync(largeWebp)).toBe(true)
    expect(imageSize(readFileSync(largeWebp)).width).toBe(600)
  })
})
