# Remove Non-Functional Newsletter Feature

| Field       | Value                                            |
| ----------- | ------------------------------------------------ |
| **Title**   | Remove Non-Functional Newsletter Feature         |
| **Type**    | chore                                            |
| **Scope**   | newsletter (API route, siteMetadata, MDX wiring) |
| **Created** | 2026-08-05 00:00:00                              |
| **Status**  | IMPLEMENTED                                      |

## Problem Statement

The site is a full Next.js 15 static export (`output: 'export'`), but it
still ships a Pliny-based newsletter feature that cannot work at runtime.
`app/api/newsletter/route.ts` declares `export const dynamic = 'force-static'`
and wraps Pliny's `NewsletterAPI`, but a statically exported site has no
server to handle the POST subscription request — so the route is dead code.
Alongside it, the `newsletter` config block in `siteMetadata.js` and the
`BlogNewsletterForm` mapping in `MDXComponents.tsx` exist only to support
that dead feature. Removing them eliminates misleading, non-functional code
and its supporting configuration.

## Current Behavior

- `app/api/newsletter/route.ts` imports `NewsletterAPI` from `pliny/newsletter`
  and reads `siteMetadata.newsletter.provider`. It is the only route under
  `app/api/`. It cannot function under static export.
- `data/siteMetadata.js` contains a `newsletter: { provider: 'buttondown' }`
  config block.
- `components/MDXComponents.tsx` imports `BlogNewsletterForm` from
  `pliny/ui/BlogNewsletterForm` and maps it into the exported `components`
  object, even though no MDX content, layout, or page renders it.
- `README.md` advertises "Newsletter Integration: Buttondown" as a feature
  and includes an `api/ (newsletter)` comment in its project-tree diagram.

## Desired Outcome

The newsletter feature and its supporting wiring are fully removed from the
codebase. The site builds cleanly as a static export with no dead newsletter
code, no orphaned config, and no references left in the code paths. `pliny`
remains installed because it powers analytics, search, comments, and
MDX/contentlayer utilities used elsewhere.

## Acceptance Criteria

- [ ] `app/api/newsletter/route.ts` is deleted, and the now-empty `app/api/`
      directory is removed.
- [ ] The `newsletter: { provider: 'buttondown' }` block is removed from
      `data/siteMetadata.js`.
- [ ] The `BlogNewsletterForm` import (line ~3) and the `BlogNewsletterForm`
      entry in the `components` map are removed from
      `components/MDXComponents.tsx`; remaining imports/entries are untouched.
- [ ] `README.md` no longer advertises the newsletter feature: the
      "Newsletter Integration: Buttondown" bullet and the `api/ (newsletter)`
      tree comment are removed or corrected.
- [ ] A repo-wide search finds no remaining _code_ references to the
      newsletter feature (`NewsletterAPI`, `BlogNewsletterForm`,
      `siteMetadata.newsletter`, `newsletter.provider`).
- [ ] `pliny` remains a dependency in `package.json`, and its analytics,
      search, comments, and contentlayer/MDX usages are unchanged.
- [ ] The production build (`next build` with `output: 'export'`, followed
      by the existing postbuild step) completes successfully.
- [ ] Lint passes (`next lint`) with no new errors introduced.

## Edge Cases & Error Handling

- **TypeScript / build breakage from the `@ts-ignore`d provider access:**
  the route used `// @ts-ignore` on `siteMetadata.newsletter.provider`.
  Removing both the route and the config block must not leave any typed
  reference to `siteMetadata.newsletter` elsewhere.
- **Empty `app/api/` directory:** newsletter is the only route, so the
  directory becomes empty and should be removed rather than left dangling.
- **Static export sanity:** confirm the build still produces a valid static
  export after the route is gone (removing an API route should not affect
  export, but verify).

## Dependencies & Constraints

- `pliny@0.4.1` must stay installed — it is imported across ~20 files for
  `pliny/analytics`, `pliny/search`, `pliny/comments`, `pliny/mdx-components`,
  `pliny/mdx-plugins`, `pliny/ui/TOCInline`, `pliny/ui/Pre`, and
  `pliny/utils/contentlayer`. There is no newsletter-only package to
  uninstall; the newsletter is a Pliny sub-module.
- Next.js 15, App Router, `output: 'export'` static export.

## Out of Scope

- Removing or altering any other Pliny feature (analytics, search, comments,
  contentlayer utils, MDX rendering).
- Uninstalling the `pliny` package or any other dependency.
- Editing starter-template blog posts
  (`data/blog/introducing-tailwind-nextjs-starter-blog.mdx`,
  `data/blog/release-of-tailwind-nextjs-starter-blog-v2.0.mdx`), the
  `data/projects/lightstimulus.mdx` roadmap mentions, or the `ai_prompts/`
  and `faq/` reference documents — their newsletter mentions are historical /
  generated content and are left untouched.
- Building any replacement newsletter/subscription mechanism.

## Notes

- Verified during spec definition: no blog MDX, layout, or page embeds
  `BlogNewsletterForm` / `NewsletterForm`; the only code references are the
  dead API route and the `MDXComponents.tsx` mapping.
- Verified: `pliny` is used extensively elsewhere, so it cannot be removed.
