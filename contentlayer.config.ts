import { defineDocumentType, ComputedFields, makeSource } from 'contentlayer2/source-files'
import { writeFileSync } from 'fs'
import readingTime from 'reading-time'
import path from 'path'
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'
import { createProjectTagCount } from './lib/generateProjectTagData'

// Remark packages
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { remarkAlert } from 'remark-github-blockquote-alert'
import {
  remarkExtractFrontmatter,
  remarkCodeTitles,
  remarkImgToJsx,
  extractTocHeadings,
} from 'pliny/mdx-plugins/index.js'
// Rehype packages
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeKatex from 'rehype-katex'
import rehypeKatexNoTranslate from 'rehype-katex-notranslate'
import rehypeCitation from 'rehype-citation'
import rehypePrismPlus from 'rehype-prism-plus'
import rehypePresetMinify from 'rehype-preset-minify'
import siteMetadata from './data/siteMetadata'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer.js'
import { createBlogTagCount } from '@/lib/generateBlogTagData'

const root = process.cwd()

// heroicon mini link
const icon = fromHtmlIsomorphic(
  `
  <span class="content-header-link">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 linkicon">
  <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
  <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
  </svg>
  </span>
`,
  { fragment: true }
)

const baseComputedFields: ComputedFields = {
  readingTime: { type: 'json', resolve: (doc) => readingTime(doc.body.raw) },
  slug: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath.replace(/^.+?(\/)/, ''),
  },
  path: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath,
  },
  filePath: {
    type: 'string',
    resolve: (doc) => doc._raw.sourceFilePath,
  },
}

const blogComputedFields: ComputedFields = {
  ...baseComputedFields,
  toc: { type: 'json', resolve: (doc) => extractTocHeadings(doc.body.raw) },
}

function createSearchIndex(allBlogs) {
  if (
    siteMetadata?.search?.provider === 'kbar' &&
    siteMetadata.search.kbarConfig.searchDocumentsPath
  ) {
    writeFileSync(
      `public/${path.basename(siteMetadata.search.kbarConfig.searchDocumentsPath)}`,
      JSON.stringify(allCoreContent(sortPosts(allBlogs)))
    )
    console.log('Local search index generated...')
  }
}

export const Blog = defineDocumentType(() => ({
  name: 'Blog',
  filePathPattern: 'blog/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: {
      type: 'json', // { en, it }
      required: true,
    },
    summary: {
      type: 'json', // { en, it }
      required: true,
    },
    date: { type: 'date', required: true },

    tags: {
      type: 'list',
      of: {
        type: 'json', // { id, label: { en, it } }
      },
      default: [],
    },

    lastmod: { type: 'date' },
    draft: { type: 'boolean' },
    images: { type: 'json' },
    authors: { type: 'list', of: { type: 'string' } },
    layout: { type: 'string' },
    bibliography: { type: 'string' },
    canonicalUrl: { type: 'string' },
  },

  computedFields: {
    ...blogComputedFields,

    titleEn: {
      type: 'string',
      resolve: (doc) => doc.title?.en ?? '',
    },
    titleIt: {
      type: 'string',
      resolve: (doc) => doc.title?.it ?? '',
    },
    summaryEn: {
      type: 'string',
      resolve: (doc) => doc.summary?.en ?? '',
    },
    summaryIt: {
      type: 'string',
      resolve: (doc) => doc.summary?.it ?? '',
    },
    structuredData: {
      type: 'json',
      resolve: (doc) => ({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: doc.title,
        datePublished: doc.date,
        dateModified: doc.lastmod || doc.date,
        description: doc.summary,
        image: doc.images ? doc.images[0] : siteMetadata.socialBanner,
        url: `${siteMetadata.siteUrl}/${doc._raw.flattenedPath}`,
      }),
    },
  },
}))

export const Authors = defineDocumentType(() => ({
  name: 'Authors',
  filePathPattern: 'authors/**/*.mdx',
  contentType: 'mdx',
  fields: {
    name: { type: 'string', required: true },
    avatar: { type: 'string' },
    occupation: { type: 'string' },
    company: { type: 'string' },
    email: { type: 'string' },
    twitter: { type: 'string' },
    bluesky: { type: 'string' },
    linkedin: { type: 'string' },
    github: { type: 'string' },

    // ✅ NEW
    focusAreas: {
      type: 'list',
      of: {
        type: 'json',
        fields: {
          title: { type: 'string', required: true },
          description: { type: 'string', required: true },
        },
      },
      default: [],
    },

    exploringNow: {
      type: 'list',
      of: { type: 'string' },
      default: [],
    },

    certifications: {
      type: 'list',
      of: {
        type: 'json',
        fields: {
          title: { type: 'string', required: true },
          issuer: { type: 'string', required: true },
          year: { type: 'number', required: true },
          image: { type: 'string' },
          url: { type: 'string' },
        },
      },
      default: [],
    },

    cv: {
      type: 'json',
      fields: {
        url: { type: 'string', required: true },
        label: { type: 'string' },
      },
    },

    layout: { type: 'string' },
  },
  computedFields: baseComputedFields,
}))

// -----------------------
// PROJECT DOCUMENT TYPE
// -----------------------

export const Project = defineDocumentType(() => ({
  name: 'Project',
  filePathPattern: 'projects/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: {
      type: 'json',
      required: true,
    },
    summary: {
      type: 'json',
      required: true,
    },
    date: { type: 'date', required: true },

    tags: {
      type: 'list',
      of: {
        type: 'json', // { id: string, label: { en, it } }
      },
      default: [],
    },

    projectType: {
      type: 'enum',
      options: ['research', 'experiment', 'product'],
    },

    status: {
      type: 'enum',
      options: ['concept', 'in-progress', 'completed'],
    },

    coverImage: { type: 'string' },

    // ✅ NEW
    stack: {
      type: 'list',
      of: { type: 'string' },
      default: [],
    },

    links: {
      type: 'json',
    },
  },
  computedFields: {
    ...baseComputedFields,
    titleEn: {
      type: 'string',
      resolve: (doc) => doc.title?.en ?? '',
    },
    summaryEn: {
      type: 'string',
      resolve: (doc) => doc.summary?.en ?? '',
    },
    structuredData: {
      type: 'json',
      resolve: (doc) => ({
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        headline: doc.title?.en,
        description: doc.summary?.en,
        datePublished: doc.date,
        image: doc.coverImage || siteMetadata.socialBanner,
        url: `${siteMetadata.siteUrl}/projects/${doc.slug}`,
      }),
    },
  },
}))

export default makeSource({
  contentDirPath: 'data',
  documentTypes: [Blog, Authors, Project],
  mdx: {
    cwd: process.cwd(),
    remarkPlugins: [
      remarkExtractFrontmatter,
      remarkGfm,
      remarkCodeTitles,
      remarkMath,
      remarkImgToJsx,
      remarkAlert,
    ],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'prepend',
          headingProperties: {
            className: ['content-header'],
          },
          content: icon,
        },
      ],
      rehypeKatex,
      rehypeKatexNoTranslate,
      [rehypeCitation, { path: path.join(root, 'data') }],
      [rehypePrismPlus, { defaultLanguage: 'js', ignoreMissing: true }],
      rehypePresetMinify,
    ],
  },
  onSuccess: async (importData) => {
    const { allBlogs, allProjects } = await importData()
    await createBlogTagCount(allBlogs)
    await createProjectTagCount(allProjects)
    createSearchIndex(allBlogs)
  },
})
