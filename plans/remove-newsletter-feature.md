# Plan: Remove Non-Functional Newsletter Feature

| Field       | Value                                    |
| ----------- | ---------------------------------------- |
| **Title**   | Remove Non-Functional Newsletter Feature |
| **Spec**    | specs/remove-newsletter-feature.md       |
| **Type**    | chore                                    |
| **Branch**  | chore/remove-newsletter-feature          |
| **Created** | 2026-08-05 00:00:00                      |
| **Status**  | IMPLEMENTED                              |

## Context

The site is a Next.js 15 static export (`output: 'export'`), so the Pliny
`NewsletterAPI` route at `app/api/newsletter/route.ts` cannot run — it is dead
code, along with its supporting `siteMetadata.newsletter` config and the
`BlogNewsletterForm` mapping in `MDXComponents.tsx` (which no MDX/layout
renders). This plan removes the feature and its wiring while keeping `pliny`
installed for the analytics, search, comments, and MDX/contentlayer features
that depend on it.

## Branch Strategy

> **Before implementation, create a new branch from the repo's base
> branch.** The implementer auto-detects the base in this priority
> order: `develop` → `main` → `master` → `origin/HEAD`. Here the base is
> `main` (confirmed: current branch `main`, `origin/HEAD` → `main`). The
> branch name is `chore/remove-newsletter-feature`.
>
> Reference command:
>
> ```bash
> git checkout main && git pull --ff-only && git checkout -b chore/remove-newsletter-feature
> ```
>
> If the repo is not a git workspace, branch creation is skipped and
> noted in the implementation report.

Branch type mapping:

- feature → `feat/<slug>`
- bug → `fix/<slug>`
- refactor → `refactor/<slug>`
- chore → `chore/<slug>`

## Commit Strategy

All commits follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

Format: `<type>[(<scope>)]: <imperative description>`

One commit per task. Each task below maps to exactly one commit.

## Build & Test Commands

| Action | Command                                                                      |
| ------ | ---------------------------------------------------------------------------- |
| Lint   | `yarn lint` (runs `next lint --fix` over app/components/lib/layouts/scripts) |
| Build  | `yarn build` (`next build` with `output: 'export'` + postbuild RSS step)     |

> Note: the project has no unit-test framework configured (no `test` script
> in `package.json`). Verification for this chore relies on lint, a
> successful static-export build, and a repo-wide grep for stale references.

## Tasks

### Task 1: Delete the dead newsletter API route `[S]`

**Goal**: Remove the non-functional API route and the now-empty `app/api/`
directory.

**Files**:

| File                          | Action | Description                                     |
| ----------------------------- | ------ | ----------------------------------------------- |
| `app/api/newsletter/route.ts` | delete | Dead Pliny `NewsletterAPI` handler              |
| `app/api/newsletter/`         | delete | Now-empty directory                             |
| `app/api/`                    | delete | Now-empty directory (newsletter was only route) |

**Steps**:

1. Delete `app/api/newsletter/route.ts` (the only route under `app/api/`).
2. Remove the empty `app/api/newsletter/` and `app/api/` directories so no
   dangling folders remain.

**Acceptance criteria covered**: route deleted; empty `app/api/` removed.

**Commit**: `chore(newsletter): remove dead newsletter API route`

---

### Task 2: Remove the newsletter config from siteMetadata `[S]`

**Goal**: Drop the orphaned `newsletter` config block.

**Files**:

| File                   | Action | Description                                                    |
| ---------------------- | ------ | -------------------------------------------------------------- |
| `data/siteMetadata.js` | modify | Remove `newsletter: { provider: 'buttondown' }` (lines ~41–43) |

**Reuse**:

| File                   | What to reuse                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| `data/siteMetadata.js` | Preserve surrounding `analytics` block (lines ~36–40) and commented `comments` block (line ~44+) exactly |

**Steps**:

1. Remove the three-line `newsletter: { provider: 'buttondown' },` block that
   sits between the `analytics` object and the commented-out `comments` block.
2. Verify no other property in `siteMetadata.js` references `newsletter`.

**Acceptance criteria covered**: newsletter config removed; no
`siteMetadata.newsletter` reference remains.

**Commit**: `chore(newsletter): remove newsletter config from siteMetadata`

---

### Task 3: Remove BlogNewsletterForm wiring from MDXComponents `[S]`

**Goal**: Remove the unused `BlogNewsletterForm` import and map entry.

**Files**:

| File                           | Action | Description                                                                                                           |
| ------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------- |
| `components/MDXComponents.tsx` | modify | Delete `import BlogNewsletterForm ...` (line 3) and the `BlogNewsletterForm,` entry in the `components` map (line 16) |

**Reuse**:

| File                           | What to reuse                                                                                                              |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `components/MDXComponents.tsx` | Keep all other imports (`TOCInline`, `Pre`, `Image`, `CustomLink`, `TableWrapper`, `Lang`) and their map entries unchanged |

**Steps**:

1. Delete the line `import BlogNewsletterForm from 'pliny/ui/BlogNewsletterForm'`.
2. Delete the `BlogNewsletterForm,` line inside the `components` object.
3. Confirm the remaining `components` map still compiles (trailing commas /
   object shape intact).

**Acceptance criteria covered**: `BlogNewsletterForm` import and map entry
removed; remaining entries untouched.

**Commit**: `chore(newsletter): remove BlogNewsletterForm from MDXComponents`

---

### Task 4: Remove newsletter references from README `[S]`

**Goal**: Stop advertising the removed feature in project docs.

**Files**:

| File        | Action | Description                                                                                                            |
| ----------- | ------ | ---------------------------------------------------------------------------------------------------------------------- |
| `README.md` | modify | Remove the "Newsletter Integration: Buttondown" bullet (line ~88) and the `api/ (newsletter)` tree comment (line ~154) |

**Steps**:

1. In the `📧 Community Features` list, remove the
   `- **Newsletter Integration**: Buttondown email subscription` bullet. Keep
   the section header and remaining bullets (Contact Form, Social Links, RSS
   Feed) — they still justify the section.
2. In the project-structure tree, since `app/api/` is being deleted (Task 1),
   remove the `│   └── api/ # API routes (newsletter)` line entirely and fix
   the tree branch character on the preceding `projects/` line so it becomes
   the last child (`└──`) under `app/`.

**Acceptance criteria covered**: README no longer advertises the newsletter
feature; tree diagram corrected.

**Commit**: `docs: remove newsletter references from README`

---

### Task 5: Verify build, lint, and absence of stale references `[S]`

**Goal**: Confirm the removal is clean and the static export still builds.

**Steps**:

1. Run a repo-wide search and confirm zero _code_ references remain:
   `NewsletterAPI`, `BlogNewsletterForm`, `siteMetadata.newsletter`,
   `newsletter.provider` (matches expected only in out-of-scope
   `data/blog/*`, `data/projects/lightstimulus.mdx`, `ai_prompts/*`, `faq/*`).
2. Confirm `pliny` is still present in `package.json` dependencies and its
   other imports (`pliny/analytics`, `pliny/search`, `pliny/comments`,
   `pliny/mdx-components`, `pliny/mdx-plugins`, `pliny/ui/TOCInline`,
   `pliny/ui/Pre`, `pliny/utils/contentlayer`) are intact.
3. Run `yarn lint` — must pass with no new errors.
4. Run `yarn build` — the `next build` static export plus postbuild step must
   complete successfully.

**Tests**: No unit-test suite exists; verification is lint + build + grep as
above.

**Acceptance criteria covered**: no stale code references; `pliny` retained;
lint passes; static-export build succeeds.

**Commit**: `chore(newsletter): verify build after newsletter removal`

> If Tasks 1–4 leave the tree in a state where lint/build already pass and
> there is nothing to change for verification, the implementer may fold this
> verification into the review of Task 4 rather than create an empty commit.

---

**Task ordering**: Tasks 1–4 are independent edits and may be done in any
order (each touches a distinct file). Task 5 (verification) must run last,
after 1–4 are complete.

## Edge Cases & Error Handling

- **`@ts-ignore`d provider access:** removing the route (Task 1) eliminates
  the only typed read of `siteMetadata.newsletter`; Task 2 removes the config.
  Task 5's grep confirms no other `siteMetadata.newsletter` reference remains.
- **Empty `app/api/` directory:** Task 1 removes the directory, not just the
  file.
- **Static export sanity:** Task 5 runs `yarn build` to confirm the
  `output: 'export'` build still succeeds without the API route.
- **README tree formatting:** Task 4 must fix the tree connector so the
  diagram stays well-formed after the `api/` line is removed.

## Verification

1. `rg -n "NewsletterAPI|BlogNewsletterForm|siteMetadata\.newsletter|newsletter\.provider" --glob '!data/blog/**' --glob '!data/projects/**' --glob '!ai_prompts/**' --glob '!faq/**'` returns no matches.
2. `pliny` still listed in `package.json`; other Pliny imports unchanged.
3. `yarn lint` passes with no new errors.
4. `yarn build` completes the static export and postbuild step successfully.
