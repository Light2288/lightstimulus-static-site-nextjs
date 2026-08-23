# About Page Visual Re-flow

| Field       | Value                           |
| ----------- | ------------------------------- |
| **Title**   | About Page Visual Re-flow       |
| **Type**    | refactor                        |
| **Scope**   | about page layout & composition |
| **Created** | 2026-08-24 00:00:00             |
| **Status**  | IMPLEMENTED                     |

## Problem Statement

The About page currently feels section-dense: a stack of similar cards with
uneven rhythm. Every section renders at near-identical visual weight —
`FocusAreas` (2-column card grid), `ExploringNow` (single glass card), and
`CertificationsGrid` (3-column card grid) sit back-to-back, each introduced by
the same gradient `h2` and wrapped in the same `glass-bg rounded-xl border`
treatment, with `CVDownloadCard` adding a fourth full-width card before the
closing bridge.

There is also no single place that owns vertical rhythm: each component
hardcodes its own top margin (`mt-14` on `FocusAreas`, `mt-16` on
`ExploringNow`, `CertificationsGrid`, `CVDownloadCard`, and
`AboutContactBridge`). Tuning the page's breathing room therefore means
editing five separate components, and the resulting spacing is inconsistent by
accident rather than by design.

Separately, the experience timeline is moving to a dedicated `/resume` page
(defined in its own spec). The About page needs a pointer to it, but currently
has none.

This is a UX/layout refinement only. No new content and no copy changes.

## Current Behavior

`app/about/page.tsx` renders, in order, inside a single
`max-w-6xl px-6 py-12` section:

1. `<h1>About</h1>` (`mb-4`)
2. `AboutProfile` — glass card, `md:grid-cols-[auto_1fr]` /
   `lg:grid-cols-[auto_1fr_1fr]` (avatar, identity + socials, highlights list)
3. MDX bio body — `<article className="prose dark:prose-invert max-w-none">`
   inside a `mt-8` wrapper, so the prose runs the full 6xl measure
4. `FocusAreas` — `mt-14`, gradient `h2`, `grid gap-6 sm:grid-cols-2` of glass
   cards
5. `ExploringNow` — `mt-16`, gradient `h2`, one glass card wrapping a
   `space-y-3` list
6. `CertificationsGrid` — `mt-16`, gradient `h2` + grouping radiogroup,
   `grid gap-6 sm:grid-cols-2 lg:grid-cols-3` of glass cards, grouped into
   `space-y-10` bands
7. `CVDownloadCard` — `mt-16`, gradient `h2`, one glass card with a description
   and a single download button
8. `AboutContactBridge` — `mt-16`, centred prose + link to `/contact`

Net effect: four consecutive full-width glass blocks of similar weight
(steps 4–7), an over-wide prose measure at step 3, and vertical rhythm
distributed across five components.

## Desired Outcome

The page reads as a sequence of deliberately differentiated bands with clear
hierarchy and breathing room, achieved purely by reordering, re-spacing, and
re-grouping the existing sections.

### Target composition order

1. **`AboutProfile`** — hero band, unchanged internally.
2. **MDX bio body** — narrower reading measure than the surrounding
   full-width bands, so the prose reads as an intimate intro rather than a
   full-bleed slab.
3. **`FocusAreas`** — full-width 2-column band.
4. **Paired row: `ExploringNow` + `CVDownloadCard`** — the two lightweight
   blocks share one horizontal band side-by-side at `lg`+, so they read as a
   single "current state / credentials" unit instead of two separate slabs.
5. **`CertificationsGrid`** — full-width band, given its own space as the
   heaviest element on the page.
6. **`AboutContactBridge`** — closing band, unchanged internally.

The rhythm therefore alternates: wide hero → narrow prose → wide grid →
paired row → wide grid → light close.

### Rhythm ownership

Vertical spacing moves out of the individual components and into a single
owning container in `app/about/page.tsx`. Each about section becomes
spacing-agnostic (no self-imposed top margin); the page defines the rhythm
scale in one place, with a larger gap _between_ bands and a smaller gap
_within_ the paired row.

### Resume pointer

`CVDownloadCard` becomes a two-action credentials card: the existing CV
download button plus a secondary link to `/resume`. This is the one permitted
string addition — a new i18n key pair (EN/IT) for the link label only. No
existing copy is reworded.

## Acceptance Criteria

- [ ] `app/about/page.tsx` renders the sections in the target order: profile,
      bio, focus areas, paired (exploring + CV/resume) row, certifications,
      contact bridge.
- [ ] `ExploringNow` and `CVDownloadCard` render side-by-side in a single row
      at the `lg` breakpoint and above, and stack in one column below `lg`.
- [ ] No about section component sets its own outer vertical margin
      (`mt-14` / `mt-16` removed from `FocusAreas`, `ExploringNow`,
      `CertificationsGrid`, `CVDownloadCard`, `AboutContactBridge`).
- [ ] Vertical rhythm is defined in one place in `app/about/page.tsx`, with a
      distinct larger between-band gap and smaller within-row gap.
- [ ] The rhythm scale is tighter on mobile and expands at desktop
      breakpoints.
- [ ] The MDX bio body renders at a narrower max-width than the full-width
      bands (no longer `max-w-none` across the full 6xl container).
- [ ] `FocusAreas` keeps 1 column below `sm` and 2 columns at `sm`+.
- [ ] `CertificationsGrid` keeps 1 → 2 (`sm`) → 3 (`lg`) columns and its
      existing grouping toggle, keyboard behavior, and `aria-live` region.
- [ ] `CVDownloadCard` renders both the existing download action and a new
      link to `/resume`, with the download remaining the primary action.
- [ ] The `/resume` link label resolves in both EN and IT.
- [ ] No section text content is added, removed, or reworded beyond the new
      `/resume` link label key.
- [ ] Existing Motion animations (profile entrance, hover lifts, exploring-now
      stagger, certification card hover) continue to work after the re-flow.
- [ ] All existing tests under `components/about/*.test.tsx` still pass, updated
      only where they assert removed spacing classes or old ordering.

## Edge Cases & Error Handling

- **Empty `focusAreas`**: `FocusAreas` returns `null` today. With rhythm owned
  by the page container, the wrapper must not leave a dangling gap where the
  section would have been.
- **Empty `exploringNow`**: `ExploringNow` returns `null`. The paired row must
  then render `CVDownloadCard` gracefully — either full-width or in its own
  column — without a visible empty half.
- **Missing `cv.url`**: `CVDownloadCard` returns `null`. The paired row must
  then render `ExploringNow` alone without a visible empty half. Decide whether
  the `/resume` pointer should still surface in this case, since it is
  independent of the CV asset.
- **Both paired items absent**: the entire paired row collapses with no
  residual spacing.
- **Empty `certifications`**: `CertificationsGrid` returns `null`; surrounding
  rhythm stays correct.
- **Missing avatar**: `AboutProfile`'s grid already handles the absent avatar
  column; the hero band must not shift when it is missing.
- **Language switch**: switching EN ↔ IT changes text lengths; the paired row
  must not break alignment when the two cards have unequal heights.
- **Reduced motion**: honour any existing reduced-motion handling; the re-flow
  must not introduce new unconditional animation.

## Dependencies & Constraints

- Must preserve the existing glassmorphism treatment and OKLCH teal/amber
  theming (`glass-bg`, `border-white/20` / `dark:border-white/10`, gradient
  `bg-clip-text` headings, `--color-primary-500` / `--color-secondary-500`).
- Bilingual EN/IT via `useLanguage()` / `t()` must keep working in every
  section; all sections except the page shell are client components.
- Motion (`motion/react`) is already used in `AboutProfile`, `FocusAreas`,
  `ExploringNow`, `CVDownloadCard`, and `CertificationsGrid` — the re-flow
  must not remove these.
- `CertificationsGrid` persists its grouping preference through
  `PreferencesService`; this behavior is untouched.
- The `/resume` page is defined in a separate spec. This spec only adds the
  outbound pointer, and must not assume anything about that page beyond the
  route existing at `/resume`.
- Content continues to come from `allAuthors` via contentlayer; no schema
  changes.
- Dark and light themes must both be verified.

## Out of Scope

- Any change to section copy, bio text, focus-area descriptions, exploring-now
  items, or certification data.
- Adding new sections or new content to the About page.
- Building the `/resume` page or the experience timeline (separate spec).
- Redesigning the glass card visual language itself (borders, blur, shadow
  treatment) beyond what re-spacing requires.
- Changes to `AboutProfile`'s or `AboutContactBridge`'s internal structure.
- Changes to `CertificationsGrid`'s grouping logic, `certificationGrouping`
  helpers, or preference persistence.
- SEO metadata changes in `app/about/page.tsx`.
- Introducing a shared `AboutSection` wrapper abstraction (considered and
  deliberately deferred in favour of centralising rhythm in the page).

## Notes

- Components involved, all under `components/about/`: `AboutProfile.tsx`,
  `FocusAreas.tsx`, `ExploringNow.tsx`, `CertificationsGrid.tsx`,
  `CVDownloadCard.tsx`, `AboutContactBridge.tsx`. `AboutContent.tsx` also
  exists in that directory but is not referenced by `app/about/page.tsx` —
  worth confirming during implementation whether it is dead code (do not
  delete it under this spec).
- Test files already exist for `AboutProfile`, `FocusAreas`, `ExploringNow`,
  `CertificationsGrid`, `CVDownloadCard`, and `AboutContactBridge`. Expect to
  touch only assertions tied to spacing classes or ordering.
- Every section heading currently repeats the same gradient `h2` recipe. Part
  of "clearer hierarchy" may mean differentiating heading scale between major
  bands and the paired row, rather than treating all five as peers — worth
  deciding during planning.
- Open question: whether the `/resume` pointer should render even when
  `cv.url` is absent (see edge cases).
