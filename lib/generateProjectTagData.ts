import { slug } from 'github-slugger'
import { writeFileSync } from 'fs'
import prettier from 'prettier'

export async function createProjectTagCount(allProjects) {
  const tagCount: Record<string, number> = {}

  allProjects.forEach((project) => {
    project.tags?.forEach((tag) => {
      const id = slug(tag.id)
      tagCount[id] = (tagCount[id] ?? 0) + 1
    })
  })

  const formatted = await prettier.format(JSON.stringify(tagCount, null, 2), {
    parser: 'json',
  })

  writeFileSync('./app/project-tag-data.json', formatted)
}
