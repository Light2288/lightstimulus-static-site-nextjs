# Add Blog-Writer and CertFlow Project Pages

| Field       | Value                                      |
| ----------- | ------------------------------------------ |
| **Title**   | Add Blog-Writer and CertFlow Project Pages |
| **Type**    | feature                                    |
| **Scope**   | data/projects (content)                    |
| **Created** | 2026-07-28 00:00:00                        |
| **Status**  | IMPLEMENTED                                |

## Problem Statement

The portfolio currently documents three projects (`lightstimulus`, `micelio`,
`remedmind`) as bilingual MDX pages under `data/projects/`. Two more real
projects — **Blog-Writer** and **CertFlow** — have been built but are not yet
represented on the site. They should be added as new project pages that match
the structure, depth, and bilingual (English + Italian) quality of the existing
pages so the portfolio reflects current work.

## Desired Outcome

Two new MDX files exist under `data/projects/`, each following the exact
frontmatter schema and content structure of the existing project pages:

- `data/projects/blog-writer.mdx`
- `data/projects/certflow.mdx`

Each file contains complete, parallel English and Italian content wrapped in
`<Lang value="en">` and `<Lang value="it">` blocks, with the same section
rhythm used by the existing pages (Overview, Motivation, System Architecture,
Key Features, Technical Excellence, Privacy/Security where relevant,
Development Philosophy, Impact, Future Directions). The pages should build
cleanly through Contentlayer2 alongside the existing project content.

### Source material

Content should be drawn from the actual project repositories:

- **Blog-Writer** — `/Users/davide/Personal/Projects/blog-writer`
- **CertFlow** — `/Users/davide/Personal/Projects/certflow`

Key facts to reflect (from each project's README):

**Blog-Writer** — a self-contained opencode project that turns recent work
across other projects into bilingual (EN + IT) MDX blog articles for a
Tailwind/Next.js blog. It **only observes** the projects it writes about and
never modifies them. Two manually-invoked agents: `topic-extractor` (read-only
analyst that surfaces candidate topics from git history and opencode session
transcripts, scores them across five dimensions, and skips already-published
topics) and `blog-writer` (drafts a bilingual article, iterates, publishes on
explicit command). Privacy/permission boundary is central: read-anywhere,
scoped edits per agent, denied destructive commands (`git push`,
`git commit --amend`, `rm -rf`), and denied secret stores. Directory-based
workflow (`inputs/`, `drafts/`, `published/`), optional `tracked-projects.txt`
allowlist, and an end-to-end acceptance test suite.

**CertFlow** — an AI-augmented certification study platform built with
Next.js (React 19, Tailwind 4, TypeScript, Vitest). Features: exam simulator,
AI tutor, topic map & AI deep dives, AI question generation & validation,
progress tracking, multi-certification support (data-only; ships with
Snowflake SnowPro Core, AWS Certified Developer – Associate, AWS Certified
Data Engineer – Associate). Content is static JSON under
`public/data/certifications/` — no backend required. Pluggable AI provider
interface (Mock, OpenAI, Anthropic, Google Gemini, Ollama, custom
OpenAI-compatible), configured in-app and persisted to `localStorage`. Global
footer with donation link, license, AI-content disclaimer, and app version.

## Acceptance Criteria

- [ ] `data/projects/blog-writer.mdx` exists and parses as valid MDX with
      frontmatter matching the existing project schema.
- [ ] `data/projects/certflow.mdx` exists and parses as valid MDX with
      frontmatter matching the existing project schema.
- [ ] Each file's frontmatter includes bilingual `title` and `summary`
      (`en` + `it`), `date`, `projectType: product`, `status: completed`,
      `coverImage`, a `tags` list (each with `id` and bilingual `label`), a
      `stack` list, and a `links` block — mirroring the field shapes used in
      `lightstimulus.mdx`, `micelio.mdx`, and `remedmind.mdx`.
- [ ] Each file contains both a `<Lang value="en">` block and a
      `<Lang value="it">` block with fully parallel content (no section present
      in one language but missing in the other).
- [ ] Section structure mirrors the existing pages: at minimum Overview,
      Motivation, System Architecture, Key Features, Technical Excellence,
      Development Philosophy, Impact, and Future Directions; Privacy/Security
      is included where relevant (both projects have a strong privacy story).
- [ ] Content is factually grounded in each project's actual repository (README
      and, where useful, package metadata), not invented capabilities.
- [ ] The `stack` for CertFlow reflects its real dependencies (e.g. Next.js,
      React 19, TypeScript, Tailwind CSS 4, Vitest, and the AI provider SDKs);
      the `stack` for Blog-Writer reflects its real tooling (e.g. opencode,
      git, sqlite3, MDX, bilingual EN/IT workflow).
- [ ] Any frontmatter value that cannot be verified from the repositories is
      filled with a sensible inferred value and clearly flagged (see below).
- [ ] Both new pages build without errors through Contentlayer2 together with
      the existing project pages.

## Frontmatter placeholders & inference

For fields not directly verifiable from the repositories, infer a sensible
value and flag it clearly (e.g. an inline `TODO:` comment or an obvious
placeholder token) so it can be finalised before publishing:

- **`date`** — infer a plausible completion date; flag for confirmation.
- **`coverImage`** — use the established path convention
  `/static/images/projects/<slug>.png` (i.e. `blog-writer.png`,
  `certflow.png`); flag that the image asset itself must be added separately.
- **`status`** — `completed` for both (per decision), flag if either is still
  a work in progress.
- **`links`** — derive `github` (and `website` where applicable) from the
  repositories if determinable; otherwise leave a flagged placeholder. Note
  Blog-Writer may have no public website; CertFlow may deploy to Vercel.

## Edge Cases & Error Handling

- Blog-Writer is a tooling/automation project rather than a user-facing app;
  its "Key Features" and "Impact" sections should describe agent behaviour,
  the observe-only guarantee, and the permission model rather than end-user UI.
- Tag `id`s should be lowercase, kebab-cased, and reuse existing tag ids where
  they genuinely apply (e.g. `nextjs`, `typescript`) to keep the site's tag
  filtering coherent; introduce new ids only where warranted.
- Italian content must be a genuine translation with matching structure, not a
  truncated or machine-literal rendering (mirror the quality of the existing
  Italian sections).

## Dependencies & Constraints

- Must conform to the Contentlayer2 project schema already in use for
  `data/projects/*.mdx`; do not introduce new frontmatter fields the schema
  does not support.
- Follow the existing bilingual `<Lang>` component pattern exactly.
- Cover-image assets under `static/images/projects/` are out of scope for this
  spec (only the MDX pages are produced); referencing the expected path is
  sufficient.

## Out of Scope

- Creating or editing the cover image files themselves.
- Any changes to the Contentlayer2 schema, components, or site configuration.
- Modifying the Blog-Writer or CertFlow source repositories in any way.
- Adding blog posts or other content types.

## Notes

- Reference exemplars for tone, length, and section rhythm:
  `data/projects/lightstimulus.mdx`, `data/projects/micelio.mdx`,
  `data/projects/remedmind.mdx`.
- Suggested slugs/filenames: `blog-writer` and `certflow`, consistent with the
  kebab-case filenames already in `data/projects/`.
