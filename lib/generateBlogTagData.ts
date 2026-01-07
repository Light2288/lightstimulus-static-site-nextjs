/**
 * Count the occurrences of all blog tags and write to blog-tag-data.json
 * Uses tag.id as the canonical key (same logic as projects)
 */
import prettier from 'prettier'
import { writeFileSync } from 'fs'

export async function createBlogTagCount(allBlogs) {
  const isProduction = process.env.NODE_ENV === 'production'

  const tagCount: Record<string, number> = {}

  allBlogs.forEach((file) => {
    if (file.tags && (!isProduction || file.draft !== true)) {
      file.tags.forEach((tag) => {
        const tagId = tag.id
        if (!tagId) return

        if (tagCount[tagId]) {
          tagCount[tagId] += 1
        } else {
          tagCount[tagId] = 1
        }
      })
    }
  })

  const formatted = await prettier.format(JSON.stringify(tagCount, null, 2), {
    parser: 'json',
  })

  writeFileSync('./app/blog-tag-data.json', formatted)
}
