# Plan: Add Blog-Writer and CertFlow Project Pages

| Field       | Value                                          |
| ----------- | ---------------------------------------------- |
| **Title**   | Add Blog-Writer and CertFlow Project Pages     |
| **Spec**    | specs/add-blog-writer-and-certflow-projects.md |
| **Type**    | feature                                        |
| **Branch**  | feat/add-blog-writer-and-certflow-projects     |
| **Created** | 2026-07-28 00:00:00                            |
| **Status**  | IMPLEMENTED                                    |

## Context

The portfolio documents projects as bilingual (EN + IT) MDX pages under
`data/projects/`. Two real projects — **Blog-Writer** and **CertFlow** — are
not yet represented. This plan adds two new project MDX pages that match the
frontmatter schema and content depth of the existing `lightstimulus.mdx`,
`micelio.mdx`, and `remedmind.mdx` pages, grounded in each project's actual
repository.

## Branch Strategy

> **Before implementation, create a new branch from the repo's base
> branch.** The implementer auto-detects the base in this priority
> order: `develop` → `main` → `master` → `origin/HEAD`. For this repo the
> base is `main`. The branch name is `feat/add-blog-writer-and-certflow-projects`.
>
> Reference command (the implementer adapts to the detected base):
>
> ```bash
> git checkout main && git pull --ff-only && git checkout -b feat/add-blog-writer-and-certflow-projects
> ```
>
> If the repo is not a git workspace, branch creation is skipped and
> noted in the implementation report.

Branch type mapping:

- feature → `feat/<slug>`

Note: existing per-project pages used one branch each (e.g.
`feat/add-micelio-project`). This spec covers both new pages, so a single
combined feature branch is used with one commit per page.

## Commit Strategy

All commits follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

Format: `<type>[(<scope>)]: <imperative description>`

One commit per task. Each task in the Tasks section maps to exactly one
commit.

## Build & Test Commands

| Action | Command                                                                                      |
| ------ | -------------------------------------------------------------------------------------------- |
| Build  | `yarn build` (runs Next.js + Contentlayer2; validates all MDX frontmatter)                   |
| Lint   | `yarn lint` (ESLint) — note: does not lint `data/**`, but Contentlayer runs during dev/build |
| Dev    | `yarn dev` (starts dev server; Contentlayer regenerates and surfaces schema errors)          |

There is no unit-test framework in this project. Verification is by successful
Contentlayer generation (via `yarn dev` or `yarn build`) plus visual review of
the rendered project pages.

## Schema Reference (from `contentlayer.config.ts`)

The `Project` document type (`filePathPattern: 'projects/**/*.mdx'`) defines:

- `title` — `json`, required (`{ en, it }`)
- `summary` — `json`, required (`{ en, it }`)
- `date` — `date`, required
- `tags` — list of `json` (`{ id, label: { en, it } }`)
- `projectType` — enum: `research` | `experiment` | `product`
- `status` — enum: `concept` | `in-progress` | `completed`
- `coverImage` — `string`
- `stack` — list of `string`
- `links` — `json` (e.g. `{ website, github }`)

The spec's chosen values (`projectType: product`, `status: completed`) are
valid enum members. Do **not** add fields outside this schema.

## Tasks

### Task 1: Add Blog-Writer project page `[M]`

**Goal**: Create a complete bilingual project MDX page for Blog-Writer that
mirrors the structure and depth of the existing project pages.

**Files**:

| File                            | Action | Description                |
| ------------------------------- | ------ | -------------------------- |
| `data/projects/blog-writer.mdx` | create | New bilingual project page |

**Reuse**:

| File                                                    | What to reuse                                                                                                                                                                                                                  |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `data/projects/lightstimulus.mdx`                       | Frontmatter shape + section rhythm for a tooling/software project (Overview → Motivation → System Architecture → Key Features → Technical Excellence → Privacy/Security → Development Philosophy → Impact → Future Directions) |
| `data/projects/remedmind.mdx`                           | Privacy & Security section structure                                                                                                                                                                                           |
| `/Users/davide/Personal/Projects/blog-writer/README.md` | Source of truth for facts (agents, workflow, permissions, directory layout, acceptance tests)                                                                                                                                  |

**Steps**:

1. Author frontmatter following the `Project` schema:
   - `title` / `summary` bilingual (EN + IT). Summary ~1–2 sentences per lang.
   - `date`: infer a plausible completion date and flag inline (e.g. a
     `# TODO: confirm date` note in chat/report — the MDX itself uses a real
     date value since the field is required and typed `date`).
   - `projectType: product`, `status: completed`.
   - `coverImage: /static/images/projects/blog-writer.png` (flag that the image
     asset must be added separately — out of scope here).
   - `tags`: choose the best-fitting tags for the project's topic (there is no
     fixed tag vocabulary — tags are free-form and can be created as needed).
     Use lowercase kebab-case ids with a bilingual `label`, e.g. `opencode`,
     `automation`, `ai-agents`, `bilingual`, `blog`.
   - `stack`: real tooling — e.g. `opencode`, `Git`, `SQLite`, `MDX`,
     `Next.js` (target blog), `Bash`, bilingual EN/IT workflow.
   - `links`: `github` if determinable from the repo; otherwise flagged
     placeholder. Blog-Writer likely has no public `website`.
2. Write the `<Lang value="en">` block with the full section set. Emphasise
   the observe-only guarantee, the two agents (`topic-extractor`,
   `blog-writer`), the five scoring dimensions, the published-topics ledger,
   the directory-based workflow (`inputs/`, `drafts/`, `published/`), the
   optional `tracked-projects.txt` allowlist, the permission boundary (scoped
   edits, denied `git push` / `git commit --amend` / `rm -rf`, denied secret
   stores), and the acceptance test suite. Frame "Key Features" and "Impact"
   around agent behaviour and the permission model rather than end-user UI.
3. Write the `<Lang value="it">` block as a genuine, structurally parallel
   Italian translation (match quality of existing IT sections; no missing
   sections, no machine-literal shortcuts).
4. Keep tag ids lowercase/kebab-case; ensure EN and IT sections have identical
   heading structure.

**Tests**:

- Run `yarn dev` (or `yarn build`) and confirm Contentlayer2 generates without
  schema/frontmatter errors for `blog-writer.mdx`.
- Visually confirm the page renders and language toggle shows both languages.

**Acceptance criteria covered**: blog-writer.mdx existence & valid MDX;
bilingual frontmatter; both `<Lang>` blocks with parallel content; section
structure incl. Privacy/Security; factual grounding; Blog-Writer stack;
placeholder flagging; Contentlayer build.

**Commit**: `feat(projects): add Blog-Writer project page`

---

### Task 2: Add CertFlow project page `[M]`

**Goal**: Create a complete bilingual project MDX page for CertFlow that
mirrors the structure and depth of the existing project pages.

**Files**:

| File                         | Action | Description                |
| ---------------------------- | ------ | -------------------------- |
| `data/projects/certflow.mdx` | create | New bilingual project page |

**Reuse**:

| File                                                    | What to reuse                                                        |
| ------------------------------------------------------- | -------------------------------------------------------------------- |
| `data/projects/lightstimulus.mdx`                       | Frontmatter shape + section rhythm for a Next.js web app             |
| `/Users/davide/Personal/Projects/certflow/README.md`    | Source of truth for facts (features, providers, data model, testing) |
| `/Users/davide/Personal/Projects/certflow/package.json` | Real dependency versions for the `stack` list                        |

**Steps**:

1. Author frontmatter following the `Project` schema:
   - `title` / `summary` bilingual (EN + IT).
   - `date`: infer a plausible completion date and flag for confirmation.
   - `projectType: product`, `status: completed`.
   - `coverImage: /static/images/projects/certflow.png` (flag image asset as
     separate/out of scope).
   - `tags`: choose the best-fitting tags for the project's topic (free-form,
     no fixed vocabulary). Use lowercase kebab-case ids with a bilingual
     `label`, e.g. `ai`, `education`, `certification`, `nextjs`, `typescript`.
   - `stack`: real dependencies from `package.json` — e.g. `Next.js 16`,
     `React 19`, `TypeScript`, `Tailwind CSS 4`, `Vitest`, `React Markdown`,
     and AI SDKs (`OpenAI`, `Anthropic`, `Google Gemini`, `Ollama`).
   - `links`: `github` and `website` (Vercel deploy) if determinable; flag any
     placeholder.
2. Write the `<Lang value="en">` block with the full section set. Cover the
   exam simulator, AI tutor, topic map & AI deep dives, AI question
   generation/validation, progress tracking, multi-certification data model
   (static JSON under `public/data/certifications/`, ships with SnowPro Core,
   AWS Developer Associate, AWS Data Engineer Associate), the pluggable AI
   provider interface (Mock/OpenAI/Anthropic/Gemini/Ollama/custom, configured
   in-app to `localStorage`, no backend), Vitest/Mock-provider testing, and the
   global footer. Include a privacy/data-ownership angle (no backend for
   content; keys stay in the browser).
3. Write the `<Lang value="it">` block as a genuine, structurally parallel
   Italian translation.
4. Keep tag ids lowercase/kebab-case; ensure EN and IT heading structures match.

**Tests**:

- Run `yarn dev` (or `yarn build`) and confirm Contentlayer2 generates without
  schema/frontmatter errors for `certflow.mdx`.
- Visually confirm the page renders and language toggle shows both languages.

**Acceptance criteria covered**: certflow.mdx existence & valid MDX; bilingual
frontmatter; both `<Lang>` blocks with parallel content; section structure;
factual grounding; CertFlow stack from real deps; placeholder flagging;
Contentlayer build.

**Commit**: `feat(projects): add CertFlow project page`

---

**Task ordering**: Tasks 1 and 2 are independent and may be done in either
order. Each is a self-contained authoring effort producing one file and one
commit.

## Edge Cases & Error Handling

- Blog-Writer is a tooling/automation project, not a user-facing app: describe
  agent behaviour and the permission model instead of end-user UI (Task 1).
- Reuse existing tag ids where they genuinely apply, but tags are free-form
  with no fixed vocabulary — always pick the best-fitting tags for the
  project's topic and create new kebab-case ids as needed (Tasks 1, 2).
- Italian content must be a genuine, structurally parallel translation — no
  section present in one language but missing in the other (Tasks 1, 2).
- `status`/`projectType` must use only the schema's enum members; if either
  project is not truly `completed`, flag it rather than inventing a value
  (Tasks 1, 2).
- Any unverifiable frontmatter (date, links, cover image) gets a sensible
  inferred value and is clearly flagged in the implementation report; the
  cover-image asset file itself is out of scope (Tasks 1, 2).

## Verification

1. Run `yarn dev` (or `yarn build`) and confirm Contentlayer2 generates both
   new documents with no frontmatter/schema errors.
2. Open `/projects/blog-writer` and `/projects/certflow`; confirm each renders,
   the language toggle switches between fully-populated EN and IT content, and
   tags/stack/links display correctly.
3. Cross-check each page's claims against the source README (and CertFlow's
   `package.json`) to confirm factual grounding.
4. Confirm every spec acceptance criterion is satisfied and all inferred
   placeholders are flagged for the user to finalise.
