# 🧰 Tech Stack & Architecture

## ⚙️ Framework & Language

The site is made with Next.js 15 and Tailwind

## 🎨 Styling System

The styling system is TailwindCSS + custom theme file.
Theme structure: define design tokens in two layers — visual variables (blur, opacity, glass colors) as CSS variables in `theme.css`,
and functional tokens (colors, font sizes, spacing) in `tailwind.config.js`.
Tailwind utilities reference these CSS variables where appropriate, ensuring both runtime flexibility and design consistency.

## 🔡 Fonts & Icons

- Color palette:
  - Light Theme
    - Background: #F8F9FB → very soft,
      bluish off-white
    - Text: #1C1C1E → deep neutral for good
      readability
    - Secondary text: #5C5C66 (muted gray-blue for
      metadata, subtitles)
  - Dark Theme (bluer spectrum)
    - Background: #0D1B2A → rich deep navy, avoids
      harsh black
    - Text: #E6EDF3 → light bluish-white, softer
      than #FFF, matches background’s hue
    - Secondary text: #9FBACD → desaturated light
      blue for metadata/subtitles
  - Accent Colors
    - Primary Accent: #4FD1C5 (teal / cyan) → works
      well on both light & dark, futuristic/tech feel
    - Secondary Accent: #FFB347 (warm amber/orange) →
      contrast color, good for highlights or call-to-actions
    - Optional Tertiary: #7C3AED (electric violet) →
      sparingly, for hover states or special emphasis
    - Usage:
      - Teal = links, key highlights
      - Amber = buttons, hover accents
      - Violet = occasional decorative elements (tags, code highlight keywords, etc.)

  - I will centralize the palette in Tailwind’s theme extension (tailwind.config.js).
    This allows to
    - Keeps design consistent across components and future refactors.
    - Use semantic tokens like text-primary, bg-accent, etc. instead of raw hex values.
    - Makes theme toggling (light/dark) seamless using Tailwind’s theme.extend.colors and data-theme or class-based toggles.
    - Simplifies future adjustments (if you tweak teal or background shades).
  - To use utility classes like text-accent-primary instead of hex codes everywhere,
    I will define small “semantic” groupings, e.g.:
    ```
      extend: {
         colors: {
            background: { light: '#F8F9FB', dark: '#0D1B2A' },
            text: { light: '#1C1C1E', dark: '#E6EDF3' },
            accent: {
               primary: '#4FD1C5',
               secondary: '#FFB347',
               tertiary: '#7C3AED',
            },
         },
      }
    ```

- Fonts:
  - IBM Plex Sans → clean, slightly more “techy”,
    subtle personality. A good nod to your IBM role
    without being branded
  - paired with IBM Plex Mono for code snippets in
    the blog
  - Host the fonts locally (import via @next/font/local)
- Icons: Heroicons and Lucide

## 📦 Additional Libraries / Tools

- ContentLayer: already installed
- MDX + Generative AI Workflows for content:
  Content Source: both blog posts and projects live as
  .mdx files in your repo, so that no CMS is used.
  For now, I will manually generate the mdx files.
  In the future, I would like
  to integrate an AI Generation Workflow: You (or an
  AI workflow/agent) generate Markdown/MDX files
  automatically. The workflow can include metadata
  (title, slug, date, tags, summary) in frontmatter.
  Publishing: Commit the new .mdx file to your
  GitHub repo (via API or GitHub Actions).
  Netlify automatically rebuilds and deploys your
  site with the new content.
- Motion.dev: not installed yet, but this package should be included to
  manage the animations. Use @motion.dev/react for structured animations (hero, section reveals).
  Tailwind transitions for microinteractions. Do not use Framer Motion.

## ☁️ Hosting & Deployment

The site is hosted on Netlify with rebuild and deploys
that starts at every merge on main branch

## 🎁 Package.json file

Here is the package.json file to check if everything
stated before is correct or not; please provide any other
useful package you would install:

```
{
"name": "tailwind-nextjs-starter-blog",
  "version": "2.4.0",
  "private": true,
  "scripts": {
    "start": "next dev",
    "dev": "cross-env INIT_CWD=$PWD next dev",
    "build": "cross-env INIT_CWD=$PWD next build && cross-env NODE_OPTIONS='--experimental-json-modules' node ./scripts/postbuild.mjs",
    "serve": "next start",
    "analyze": "cross-env ANALYZE=true next build",
    "lint": "next lint --fix --dir pages --dir app --dir components --dir lib --dir layouts --dir scripts",
    "lint:fix": "eslint . --ext .ts,.tsx --fix && prettier --write .",
    "prepare": "husky"
  },
  "dependencies": {
    "@headlessui/react": "2.2.0",
    "@heroicons/react": "^2.2.0",
    "@next/bundle-analyzer": "15.2.4",
    "@tailwindcss/forms": "^0.5.9",
    "@tailwindcss/postcss": "^4.0.5",
    "@tailwindcss/typography": "^0.5.15",
    "body-scroll-lock": "^4.0.0-beta.0",
    "clsx": "^2.1.1",
    "contentlayer2": "0.5.5",
    "cross-env": "^7.0.3",
    "esbuild": "0.25.2",
    "github-slugger": "^2.0.0",
    "gray-matter": "^4.0.2",
    "gsap": "^3.13.0",
    "hast-util-from-html-isomorphic": "^2.0.0",
    "lucide-react": "^0.545.0",
    "motion": "^12.23.24",
    "next": "^15.5.4",
    "next-contentlayer2": "0.5.5",
    "next-seo": "^6.8.0",
    "next-themes": "^0.4.6",
    "pliny": "0.4.1",
    "postcss": "^8.4.24",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "reading-time": "1.5.0",
    "rehype-autolink-headings": "^7.1.0",
    "rehype-citation": "^2.3.0",
    "rehype-katex": "^7.0.0",
    "rehype-katex-notranslate": "^1.1.4",
    "rehype-preset-minify": "7.0.0",
    "rehype-prism-plus": "^2.0.0",
    "rehype-slug": "^6.0.0",
    "remark": "^15.0.0",
    "remark-gfm": "^4.0.0",
    "remark-github-blockquote-alert": "^1.2.1",
    "remark-math": "^6.0.0",
    "tailwindcss": "^4.0.5",
    "unist-util-visit": "^5.0.0"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.2.0",
    "@eslint/js": "^9.16.0",
    "@svgr/webpack": "^8.0.1",
    "@types/mdx": "^2.0.12",
    "@types/react": "^19.0.8",
    "@typescript-eslint/eslint-plugin": "^8.12.0",
    "@typescript-eslint/parser": "^8.12.0",
    "eslint": "^9.14.0",
    "eslint-config-next": "15.2.4",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.2.0",
    "globals": "^15.12.0",
    "husky": "^9.0.0",
    "image-size": "^2.0.2",
    "lint-staged": "^13.0.0",
    "prettier": "^3.0.0",
    "prettier-plugin-tailwindcss": "^0.6.11",
    "typescript": "^5.1.3"
  },
```

## 🗂️ Folder / Project Structure

This is the current project structure, excluded the
generated folders:
.
├── LICENSE
├── README.md
├── ai_prompts
│   ├── functional_and_behavioural_aspects.md
│   ├── general_site_content.md
│   ├── optional_extras.md
│   ├── pages_and_structure.md
│   ├── site_complete_specs.md
│   ├── styling_and_design.md
│   └── tech_stack_and_architecture.md
├── app
│   ├── Main.tsx
│   ├── about
│   │   └── page.tsx
│   ├── api
│   │   └── newsletter
│   │   └── route.ts
│   ├── blog
│   │   ├── [...slug]
│   │   │   └── page.tsx
│   │   ├── page
│   │   │   └── [page]
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── not-found.tsx
│   ├── page.tsx
│   ├── project-tag-data.json
│   ├── projects
│   │   └── page.tsx
│   ├── robots.ts
│   ├── seo.tsx
│   ├── sitemap.ts
│   ├── tag-data.json
│   └── theme-providers.tsx
├── components
│   ├── Card.tsx
│   ├── Comments.tsx
│   ├── Image.tsx
│   ├── LayoutWrapper.tsx
│   ├── Link.tsx
│   ├── MDXComponents.tsx
│   ├── MobileNav.tsx
│   ├── PageTitle.tsx
│   ├── ScrollTopAndComment.tsx
│   ├── SearchButton.tsx
│   ├── SectionContainer.tsx
│   ├── TableWrapper.tsx
│   ├── Tag.tsx
│   ├── common
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── LanguageToggle.tsx
│   │   ├── Layout.tsx
│   │   ├── LogoStatic.tsx
│   │   ├── SectionHeader.tsx
│   │   └── ThemeToggle.tsx
│   ├── home
│   │   ├── FixedAnalogyParagraph.tsx
│   │   ├── ProjectsPreview.tsx
│   │   ├── Taglines.tsx
│   │   └── hero
│   │   ├── Hero.tsx
│   │   ├── LogoAnimation.tsx
│   │   └── TextAnimation.tsx
│   ├── projects
│   │   ├── ProjectCardBase.tsx
│   │   ├── ProjectCardGrid.tsx
│   │   ├── ProjectCardSmall.tsx
│   │   └── ProjectsGrid.tsx
│   └── social-icons
│   ├── icons.tsx
│   └── index.tsx
├── contentlayer.config.ts
├── contexts
│   └── LanguageContext.tsx
├── css
│   ├── prism.css
│   └── tailwind.css
├── data
│   ├── authors
│   │   ├── default.mdx
│   │   └── sparrowhawk.mdx
│   ├── blog
│   │   ├── code-sample.mdx
│   │   ├── deriving-ols-estimator.mdx
│   │   ├── github-markdown-guide.mdx
│   │   ├── guide-to-using-images-in-nextjs.mdx
│   │   ├── introducing-tailwind-nextjs-starter-blog.mdx
│   │   ├── my-fancy-title.mdx
│   │   ├── nested-route
│   │   │   └── introducing-multi-part-posts-with-nested-routing.mdx
│   │   ├── new-features-in-v1.mdx
│   │   ├── pictures-of-canada.mdx
│   │   ├── release-of-tailwind-nextjs-starter-blog-v2.0.mdx
│   │   └── the-time-machine.mdx
│   ├── headerNavLinks.ts
│   ├── logo.svg
│   ├── projects
│   │   ├── project-1.mdx
│   │   ├── project-10.mdx
│   │   ├── project-2.mdx
│   │   ├── project-3.mdx
│   │   ├── project-4.mdx
│   │   ├── project-5.mdx
│   │   ├── project-6.mdx
│   │   ├── project-7.mdx
│   │   ├── project-8.mdx
│   │   └── project-9.mdx
│   ├── projectsData.ts
│   ├── references-data.bib
│   └── siteMetadata.js
├── eslint.config.mjs
├── faq
│   ├── custom-mdx-component.md
│   ├── customize-kbar-search.md
│   └── deploy-with-docker.md
├── jsconfig.json
├── layouts
│   ├── AuthorLayout.tsx
│   ├── ListLayout.tsx
│   ├── ListLayoutWithTags.tsx
│   ├── PostBanner.tsx
│   ├── PostLayout.tsx
│   ├── PostSimple.tsx
│   └── ProjectsListLayoutWithTags.tsx
├── lib
│   ├── generateProjectTagData.ts
│   └── preferences
│   └── PreferencesService.ts
├── locales
│   ├── en.json
│   └── it.json
├── netlify.toml
├── next-env.d.ts
├── next.config.js
├── package-lock.json
├── package.json
├── postcss.config.js
├── prettier.config.js
├── scripts
│   ├── postbuild.mjs
│   └── rss.mjs
├── tsconfig.json
├── types
│   ├── localizedTag.d.ts
│   └── project.d.ts
└── utils
└── detectRefreshOrFirstLoad.ts

To improve maintainability, create two additional component folders:

- `/components/ui`: contains reusable UI primitives (Button, Toggle, CardBase, etc.)
- `/components/common`: contains higher-level layout components reused across pages (Header, Footer, Layout, SectionWrapper, etc.)
  This structure separates composable UI elements from layout and logic containers.

## 🧭 Version Control & Workflow

For now, commits, pull requests and merges are made manually
As said, if there is some pull request that is merged into main,
Netlify will trigger an automation to rebuild and deploy the site agian
It would be interesting to add other automations (for example
Github action) but for now don't consider them
