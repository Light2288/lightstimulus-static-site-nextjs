# 🧩 Optional Extras

## 🎞️ Animations

No particular animation library or style is required. For the library,
I see that Framer is not installed but evaluate if anything should be
added to provide a better UX for the site. You can also evaluate the style
of the animations to provide the best UX possible, I don't have any
particular preference on this topic.

## 🌍 Internationalization

The site should support both English and Italian. The site should change
language based on system settings of the user. Evaluate if a button in the
navigation bar should be added to programmatically change the language.
In this perspective, also consider that the blog articles (see next paragraph)
should be available in both supported languages, so probably the MDX
management should take this into consideration.

## 📝 Blog or CMS Setup

For the blog articles, I will use Markdown/MDX (no CMS)
In the process, I will store blog posts and projects as .mdx in the repo
for lowest complexity and highest control. In the future, the idea is to
automate some content generation with AI:

- Content Source: blog posts and projects live as .mdx files in your repo.
  AI Generation:
- You (or an AI workflow/agent) generate Markdown/MDX files automatically.
  The workflow can include metadata (title, slug, date, tags, summary) in frontmatter.
- Publishing:
  Commit the new .mdx file to your GitHub repo (via API or GitHub Actions).
  Netlify automatically rebuilds and deploys your site with the new content.

As said in the previous section, this approach must manage also the
internationalization/the fact that all the articles are present in all
the supported languages

## 🧰 Build / Dev Tools

Linting and prettier are already present as dev dependencies, but give
suggestions on how to get the best out of them. The same is true for "husky"
package that is a dev dependency but please give suggestions on how to use it.
No need to add other tools like storybook.

## 🚀 Deployment Workflow

Deployment is made through Netlify where the site is hosted. Each change will
be made on a feature branch and when the feature branch is merged into
main branch, the netlify pipeline will trigger and deploy the new site.
I think netlify can also manage changes previews but I don't know exactly how
to use it. For now, I check for the site preview through local building and
running.

## ℹ️ Additional info on Pliny library

Here is what the author of the starter project (https://github.com/timlrx/tailwind-nextjs-starter-blog)
wrote in the "Release of Tailwind Nextjs Starter Blog template v2.0" blog article
about the starter project setup and the Pliny library/package:

```
## Introduction

Welcome to the release of Tailwind Nextjs Starter Blog template v2.0. This release is a major refactor of the codebase to support Nextjs App directory and React Server Components. Read on to discover the new features and how to migrate from V1.

<TOCInline toc={props.toc} exclude="Introduction" />

## V1 to V2

![Github Traffic](/static/images/github-traffic.png)

The template was first released in January 2021 and has since been used by thousands of users. It is featured on [Next.js Templates](https://vercel.com/templates/next.js/tailwind-css-starter-blog), [Tailwind Awesome](https://www.tailwindawesome.com/resources/tailwind-nextjs-starter-blog) among other listing sites. It attracts 200+ unique visitors daily notching 1500-2000 page views, with 1.3k forks and many other clones.

Many thanks to the community of users and contributors for making this template a success! I created a small video montage of the blogs (while cleaning up the list in the readme) to showcase the diversity of the blogs created using the template and to celebrate the milestone:

<video controls>
  <source
    src="https://github-production-user-asset-6210df.s3.amazonaws.com/28362229/258559849-2124c81f-b99d-4431-839c-347e01a2616c.webm"
    type="video/webm"
  />
</video>

Version 2 builds on the success of the previous version and introduces many new features and improvements. The codebase has been refactored to support Next.js App directory and React Server Components. Markdown / MDX is now processed using Contentlayer, a type-safe content SDK that validates and transforms your content into type-safe JSON data. It integrates with Pliny, a new library that provides out of the box Next.js components to enhance your static site with analytics, comments and newsletter subscription. A new command palette (⌘-k) search component is also added to the template.

Let's dive into the new features and improvements in V2.

## Next.js App Directory and React Server Components

Now that [Next.js App router](https://nextjs.org/docs/app) is finally stable and is mostly feature compatible with Page Router, the codebase has been migrated to new setup. This allows for a hybrid rendering approach, with the use of React Server Components generated on the server side for faster page loads and smaller bundle sizes, while retaining the ability to sprinkle in client side React components for interactivity.[^1]

With addition powers comes a [new paradigm](https://nextjs.org/docs/getting-started/react-essentials) to learn. I have migrated the codebase to make use of the new features as much as possible. This includes changes in the folder structure, splitting components into server vs client components, leveraging server side data fetching and using the recommended [Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata) API for SEO discoverability.

While this simplifies the codebase to some extent, it makes migration from the old codebase more difficult. If you are looking to migrate, I recommend starting from a fresh template and copying over your customizations and existing content. See the [migration recommendations](#migration-recommendations) section for more details.

## Typescript First

The codebase has been migrated to Typescript. While the previous version of the template was available in both Javascript and Typescript, I decided to reduce the maintenance burden and focus on Typescript. This also allows for better type checking and code completion in IDEs.

Typescript is also a perfect match with our new type-safe markdown processor - Contentlayer.

## Contentlayer

[Contentlayer](https://www.contentlayer.dev/) is a content SDK that validates and transforms your content into type-safe JSON data that you can easily import into your application. It makes working with local markdown or MDX files a breeze. This replaces `MDX-bundler` and our own markdown processing workflow.

First, a content source is defined, specifying the name of the document type, the source where it is located along with the frontmatter fields and any additional computed fields that should be generated as part of the process.

ts:contentlayer.config.ts
export const Blog = defineDocumentType(() => ({
  name: 'Blog',
  filePathPattern: 'blog/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
    ...
  },
  computedFields: {
    readingTime: { type: 'json', resolve: (doc) => readingTime(doc.body.raw) },
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath.replace(/^.+?(\/)/, ''),
    }
    ...
  },
}))


Contentlayer then processes the MDX files with our desired markdown remark or rehype plugins, validates the schema, generate type definitions and output json files that can be easily imported in our pages. Hot reloading comes out of the box, so edits to the markdown files will be reflected in the browser immediately!

## Pliny

A large reason for the popularity of the template was its customizability and integration with other services from analytics providers to commenting solutions. However, this means that a lot of boilerplate code has to be co-located within the template even if the user does not use the feature. Updates and bug fixes had to be copied manually to the user's codebase.

To solve this, I have abstracted the logic to a separate repository - [Pliny](https://github.com/timlrx/pliny). Pliny provides out of the box Next.js components to enhance static sites:

- Analytics
    - Google Analytics
    - Plausible Analytics
    - Simple Analytics
    - Umami Analytics
    - Posthog
- Comments
    - Disqus
    - Giscus
    - Utterances
- Newsletter (uses Next 13 API Routes)
    - Buttondown
    - Convertkit
    - Email Octopus
    - Klaviyo
    - Mailchimp
    - Revue
- Command palette search with tailwind style sheet
    - Algolia
    - Kbar (local search)
- UI utility components
    - Bleed
    - Newsletter / Blog Newsletter
    - Pre / Code block
    - Table of Contents

Choose your preferred service by modifying `siteMetadata.js` and changing the appropriate fields. For example to change from Umami Analytics to Plausible, we can change the following fields:

diff-js:siteMetadata.js
analytics: {
-   umamiAnalytics: {
-     // We use an env variable for this site to avoid other users cloning our analytics ID
-     umamiWebsiteId: process.env.NEXT_UMAMI_ID, // e.g. 123e4567-e89b-12d3-a456-426614174000
-   },
+    plausibleAnalytics: {
+      plausibleDataDomain: '', // e.g. tailwind-nextjs-starter-blog.vercel.app
+    },
},


Changes in the configuration file gets propagated to the components automatically. No modification to the template is required.

Under the hood, Pliny exports high level components such as `<Analytics analyticsConfig={analyticsConfig}/>` and `<Comments commentsConfig={commentsConfig}/>` which takes in a configuration object and renders the appropriate component. Since the layouts are defined on the server side, Next.js is able to use the configuration object to determine which component to render and send only the required component bundle to the client.

## New Search Component

What's a blog in 2023 without a command palette search bar?

One of the most highly requested features have been added 🎉! The search component supports 2 search providers - Algolia and Kbar local search.

### Algolia

[Algolia Docsearch](https://docsearch.algolia.com/) is popular free service used across many documentation websites. It automatically scrapes the website that has is submitted for indexing and makes the search result available via a beautiful dialog modal. The pliny component is greatly inspired by the Docusaurus implementation and comes with a stylesheet that is compatible with the Tailwind CSS theme.

### Kbar

[Kbar](https://github.com/timc1/kbar) is a fast, portable, and extensible cmd+k interface. The pliny implementation uses kbar to create a local search dialog box. The component loads a JSON file, default `search.json`, that was created in the contentlayer build process. Try pressing ⌘-k or ctrl-k to see the search bar in action!

## Styling and Layout Updates

### Theming

`tailwind.config.js` has been updated to use tailwind typography defaults where possible and to use the built-in support for dark mode via the `prose-invert` class. This replaces the previous `prose-dark` class and configuration.

The primary theme color is updated from `teal` to `pink` and the primary gray theme from `neutral` to `gray`.

Inter is now replaced with Space Grotesk as the default font.

### New Layouts

Layout components available in the `layouts` directory, provide a simple way to customize the look and feel of the blog.[^2]

The downside of building a popular template is that you start seeing multiple similar sites everywhere 😆. While users are encouraged to customized the layouts to their liking, having more layout options that are easily switchable promotes diversity and perhaps can be a good starting point for further customizations.

In v2, I added a new post layout - `PostBanner`. It features a large banner image and a centered content container. Check out "[Pictures of Canada](/blog/pictures-of-canada)" blog post which has been updated to use the new layout.

The default blog listing layout has also been updated to include a side bar with blog tags. The search bar in the previous layout has been replace with the new command palette search. To switch back to the old layout, simply change the pages that use the `ListLayoutWithTags` component back to the original `ListLayout`.

## Migration Recommendations

Due to the large changes in directory structure, setup and tooling, I recommend starting from a fresh template and copying existing content, followed by incrementally migrating changes over to the new template.

Styling changes should be relatively minor and can be copied over from the old `tailwind.config.js` to the new one. If copying over, you might need to add back the `prose-dark` class to components that opt into tailwind typography styling. Do modify the font import in the root layout component to use the desired font of choice.

Changes to the MDX processing pipeline and schema can be easily ported to the new Contentlayer setup. If there are changes to the frontmatter fields, you can modify the document type in `contentlayer.config.ts` to include the new fields. Custom plugins can be added to the `remarkPlugins` and `rehypePlugins` properties in the `makeSource` export of `contentlayer.config.ts`.

Markdown layouts are no longer sourced automatically from the `layouts` directory. Instead, they have to be specified in the `layouts` object defined in `blog/[...slug]/page.tsx`.[^3]

To port over larger components or pages, I recommend first specificing it as a client component by using the `"use client"` directive. Once it renders correctly, you can split the interactive components (parts that rely on `use` hooks) as a client component and keep the remaining code as a server component. Consult the comprehensive Next.js [migration guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration#migrating-from-pages-to-app) for more details.
```

and here is the Pliny library readme file:

```
Pliny

Pliny provides out of the box components to enhance your static site:

Analytics
Google Analytics
Plausible Analytics
Simple Analytics
Umami Analytics
Posthog
Microsoft Clarity
Comments
Disqus
Giscus
Utterances
Newsletter (uses Next 13 API Routes)
Buttondown
Convertkit
Email Octopus
Klaviyo
Mailchimp
Beehiiv
Command palette search with tailwind style sheet
Algolia
Kbar (local search)
UI utility components
Bleed
Newsletter / Blog Newsletter
Pre / Code block
Table of Contents
as well as a bunch of MDX and contentlayer utility functions which I use to build Tailwind Nextjs Starter Blog and my own sites.

It is based on Next.js, Tailwind CSS and Contentlayer. For an example of how all the components can be used together, check out the Tailwind Nextjs Starter Blog.

Note: The previous cli and starter template have been deprecated. Please use the new components directly in your favourite Next 13 websites.

Note 2: The components are intended to be use within Next 13 app directory setup with Contentlayer. You might still be able to use the components in older websites but there's no official support for it, especially since many components are now using next/navigation instead of next/router.

This project is still in beta. Please report any issues or feedbacks.

Installation

npm i pliny
As many of the components are styled with tailwindcss, you will need to include the path to the library within the content section of your tailwind config file:

module.exports = {
  content: [
    './node_modules/pliny/**/*.js',
    './pages/**/*.{html,js}',
    './components/**/*.{html,js}',
  ],
  // ...
}
Components

Analytics

The Analytics component provides an easy interface to switch between different analytics providers. It might not be as feature rich as the official analytics providers but it should be sufficient for simple use cases.

All components default to the hosted service, but can be configured to use a self-hosted or proxied version of the script by providing the src / apiHost props to the respective analytics component.

Note: As an external script will be loaded, do ensure that script-src in the content security policy of next.config.js has been configured to whitelist the domain.

import { Analytics, AnalyticsConfig } from 'pliny/analytics'

const analytics: AnalyticsConfig = {
    // If you want to use an analytics provider you have to add it to the
    // content security policy in the `next.config.js` file.
    // supports Plausible, Simple Analytics, Umami, Posthog or Google Analytics.
    plausibleAnalytics: {
      plausibleDataDomain: '', // e.g. tailwind-nextjs-starter-blog.vercel.app
    },
    simpleAnalytics: {},
    umamiAnalytics: {
      umamiWebsiteId: '', // e.g. 123e4567-e89b-12d3-a456-426614174000
    },
    posthogAnalytics: {
      posthogProjectApiKey: '', // e.g. 123e4567-e89b-12d3-a456-426614174000
    },
    googleAnalytics: {
      googleAnalyticsId: '', // e.g. G-XXXXXXX
    },
    clarityAnalytics: {
      ClarityWebsiteId: '', // e.g. abcdefjhij
    },
  }

export default function Layout() {
  return (
    ...
    <Analytics analyticsConfig={analyticsConfig} />
  )
}
You can also use the individual analytics components directly.

Google Analytics

import { GA } from 'pliny/analytics/GoogleAnalytics'

const googleAnalyticsId = '' // e.g. UA-000000-2 or G-XXXXXXX

export default function Layout() {
  return (
    ...
    <GA googleAnalyticsId={googleAnalyticsId} />
  )
}
Microsoft Clarity Analytics

import { GA } from 'pliny/analytics/MicrosoftClarity'

const ClarityWebsiteId = '' // e.g. abcdefjhij

export default function Layout() {
  return (
    ...
    <Clarity ClarityWebsiteId={ClarityWebsiteId} />
  )
}
Plausible Analytics

import { Plausible } from 'pliny/analytics/Plausible'

const plausibleDataDomain = '' // e.g. tailwind-nextjs-starter-blog.vercel.app

export default function Layout() {
  return (
    ...
    <Plausible plausibleDataDomain={plausibleDataDomain} />
  )
}
Simple Analytics

import { SimpleAnalytics } from 'pliny/analytics/SimpleAnalytics'

export default function Layout() {
  return (
    ...
    <SimpleAnalytics />
  )
}
Umami Analytics

import { Umami } from 'pliny/analytics/Umami'

const umamiWebsiteId = '' // e.g. 123e4567-e89b-12d3-a456-426614174000

export default function Layout() {
  return (
    ...
    <Umami umamiWebsiteId={umamiWebsiteId} />
  )
}
Posthog

import { Posthog } from 'pliny/analytics/Posthog'

const posthogProjectApiKey: '', // e.g. AhnJK8392ndPOav87as450xd

export default function Layout() {
  return (
    ...
    <Posthog posthogProjectApiKey={posthogProjectApiKey} />
  )
}
Comments

The Comments component provides an easy interface to switch between different comments providers.

import { Comments, CommentsConfig } from 'pliny/comments'
import siteMetadata from '@/data/siteMetadata'

export default function BlogComments({ slug }: { slug: string }) {
  return <Comments commentsConfig={commentsConfig as CommentsConfig} slug={slug} />
}
You can also use the individual comments components directly.

Giscus

import { Giscus, GiscusProps } from 'pliny/comments/Giscus'

export default function BlogComments(props: GiscusProps) {
  return <Giscus {...props} />
}
Disqus

import { Disqus, DisqusProps } from 'pliny/comments/Disqus'

export default function BlogComments(props: DisqusProps) {
  return <Disqus {...props} />
}
Utterances

import { Utterances, UtterancesProps } from 'pliny/comments/Utterances'

export default function BlogComments(props: UtterancesProps) {
  return <Utterances {...props} />
}
Newsletter

The Newsletter component provides a Next 13 API route to integrate a newsletter subscription API with various providers. E.g. in app/api/newsletter/route.ts

import { NewsletterAPI } from 'pliny/newsletter'
import siteMetadata from '@/data/siteMetadata'

const handler = NewsletterAPI({
  provider: '', // Use one of mailchimp, buttondown, convertkit, klaviyo emailOctopus
})

export { handler as GET, handler as POST }
You can then send a POST request to the API route with a body with the email - { email: 'new_email@gmail.com' }. See the NewsletterForm component in pliny/ui/NewsletterForm for an example.

Search

The Search component provides an easy interface to switch between different search providers. If you are using algolia, you will need to import the css file as well - import 'pliny/search/algolia.css'.

import { SearchProvider, SearchConfig } from 'pliny/search'

export default function Layout() {
  return <SearchProvider searchConfig={searchConfig as SearchConfig}>...</SearchProvider>
}
You can also use the individual search components directly.

Kbar

You can pass in an optional defaultActions to kbarConfig to customize the default actions. See Kbar documentation for more details.

import { KBarSearchProvider } from 'pliny/search/KBar'

export default function Layout() {
  return <KBarSearchProvider kbarConfig={{ searchDocumentsPath: 'abc' }}>...</KBarSearchProvider>
}
Use KBarButton to add a button which toggles the command palette on click event.

import { KBarButton } from 'pliny/search/KBarButton'

export default function SearchButton() {
  return (
    <KBarButton aria-label="Search Content">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
    </KBarButton>
  )
}
Algolia

import 'pliny/search/algolia.css'
import { AlgoliaSearchProvider } from 'pliny/search/Algolia'

export default function Layout() {
  return (
    <AlgoliaSearchProvider
      algoliaConfig={{
        appId: 'R2IYF7ETH7',
        apiKey: '599cec31baffa4868cae4e79f180729b',
        indexName: 'docsearch',
      }}
    >
      ...
    </AlgoliaSearchProvider>
  )
}
Use AlgoliaButton to add a button which toggles the command palette on click event.

import { AlgoliaButton } from 'pliny/search/AlgoliaButton'

export default function SearchButton() {
  return (
    <AlgoliaButton aria-label="Search Content">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
    </AlgoliaButton>
  )
}
MDX plugins

Add the plugins to remarkPlugins in contentlayer or other MDX processors.

Remark Extract Frontmatter

Extracts frontmatter from markdown file and adds it to the file's data object. Used to pass frontmatter fields to subsequent remark / rehype plugins.

Remark code title

Parses title from code block and inserts it as a sibling title node.

Remark Img To Jsx

Converts markdown image nodes to next/image jsx.

Remark TOC Headings

Extracts TOC headings from markdown file and adds it to the file's data object. Alternatively, it also exports a extractTocHeadings function which can be used within contentlayer to create a computedField with the TOC headings.

MDX components

While these can be used in any React code, they can also be passed down as MDXComponents and used within MDX files.

Bleed

Useful component to break out of a constrained-width layout and fill the entire width.

Pre / Code block

Simple code block component with copy to clipboard button.

TOCInline

Table of contents component which can be used within a markdown file. asDisclosure will wrap the TOC in a details element with a summary element. collapse will collapse the TOC when AsDisclosure is true. Modify the list style by passing in a ulClassName and liClassName prop. For example, if you are using Tailwind css and want to revert to the default HTML list style set ulClassName="[&_ul]:list-[revert]" and you want to change styles of your list items liClassName="underline decoration-sky-500" .

NewsletterForm / BlogNewsletterForm

Newsletter form component to add a subscriber to your mailing list.
```
