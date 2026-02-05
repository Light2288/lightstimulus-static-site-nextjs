import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { escape } from 'pliny/utils/htmlEscaper.js'
import siteMetadata from '../data/siteMetadata.js'
import blogTagData from '../app/blog-tag-data.json' with { type: 'json' }
import { allBlogs } from '../.contentlayer/generated/index.mjs'
import { sortPosts } from 'pliny/utils/contentlayer.js'

const outputFolder = process.env.EXPORT ? 'out' : 'public'

const generateRssItem = (config, post) => {
  // Handle localized title and summary (use English version)
  const title = typeof post.title === 'object' ? post.title.en : post.title
  const summary = typeof post.summary === 'object' ? post.summary.en : post.summary

  // Handle localized tags (extract tag IDs)
  const tagCategories = post.tags
    ? post.tags
        .map((t) => {
          const tagId = typeof t === 'object' ? t.id : t
          return `<category>${tagId}</category>`
        })
        .join('')
    : ''

  return `
  <item>
    <guid>${config.siteUrl}/blog/${post.slug}</guid>
    <title>${escape(title)}</title>
    <link>${config.siteUrl}/blog/${post.slug}</link>
    ${summary && `<description>${escape(summary)}</description>`}
    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    <author>${config.email} (${config.author})</author>
    ${tagCategories}
  </item>
`
}

const generateRss = (config, posts, page = 'feed.xml') => `
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>${escape(config.title)}</title>
      <link>${config.siteUrl}/blog</link>
      <description>${escape(config.description)}</description>
      <language>${config.language}</language>
      <managingEditor>${config.email} (${config.author})</managingEditor>
      <webMaster>${config.email} (${config.author})</webMaster>
      <lastBuildDate>${posts[0] ? new Date(posts[0].date).toUTCString() : new Date().toUTCString()}</lastBuildDate>
      <atom:link href="${config.siteUrl}/${page}" rel="self" type="application/rss+xml"/>
      ${posts.map((post) => generateRssItem(config, post)).join('')}
    </channel>
  </rss>
`

async function generateRSS(config, allBlogs, page = 'feed.xml') {
  const publishPosts = allBlogs.filter((post) => post.draft !== true)
  // RSS for blog post
  if (publishPosts.length > 0) {
    const rss = generateRss(config, sortPosts(publishPosts))
    writeFileSync(`./${outputFolder}/${page}`, rss)
  }

  if (publishPosts.length > 0) {
    for (const tag of Object.keys(blogTagData)) {
      const filteredPosts = allBlogs.filter((post) =>
        post.tags?.some((t) => {
          const tagId = typeof t === 'object' ? t.id : t
          return tagId === tag
        })
      )
      const rss = generateRss(config, filteredPosts, `tags/${tag}/${page}`)
      const rssPath = path.join(outputFolder, 'tags', tag)
      mkdirSync(rssPath, { recursive: true })
      writeFileSync(path.join(rssPath, page), rss)
    }
  }
}

const rss = () => {
  generateRSS(siteMetadata, allBlogs)
  console.log('RSS feed generated...')
}
export default rss
