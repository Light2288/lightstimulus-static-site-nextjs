# Plan: Bilingual Netlify Contact Form

| Field       | Value                          |
| ----------- | ------------------------------ |
| **Title**   | Bilingual Netlify Contact Form |
| **Spec**    | specs/contact-form-netlify.md  |
| **Type**    | feature                        |
| **Branch**  | feat/contact-form-netlify      |
| **Created** | 2026-08-04 00:00:00            |
| **Status**  | IMPLEMENTED                    |

## Context

The `/contact` page currently exposes only passive email/LinkedIn methods
(`components/contact/ContactMethods.tsx`) and offers no way to send a message
in-page. This plan adds an accessible, bilingual (EN/IT) contact form as the
primary CTA above the existing methods, backed by Netlify Forms. Because the
site is a static export (`output: 'export'`) with client-rendered components,
a static HTML detection form under `public/` is required so Netlify registers
the form at deploy time, while the interactive React form submits via AJAX.

## Branch Strategy

> **Before implementation, create a new branch from the repo's base
> branch.** The implementer auto-detects the base in this priority
> order: `develop` → `main` → `master` → `origin/HEAD`. The branch
> name is `feat/contact-form-netlify`.
>
> Reference command (the implementer adapts to the detected base):
>
> ```bash
> git checkout <base> && git pull --ff-only && git checkout -b feat/contact-form-netlify
> ```
>
> If the repo is not a git workspace, branch creation is skipped and
> noted in the implementation report.

## Commit Strategy

All commits follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

Format: `<type>[(<scope>)]: <imperative description>`

One commit per task. Each task in the Tasks section maps to exactly one commit.

## Build & Test Commands

| Action | Command                                       |
| ------ | --------------------------------------------- |
| Lint   | `npm run lint`                                |
| Build  | `npm run build` (Next static export → `out/`) |
| Dev    | `npm run dev`                                 |

> **Note — no automated test framework.** The project has no Jest/Vitest/
> Playwright setup and no existing `*.test.*` / `*.spec.*` files. Verification
> is therefore manual (lint + build + local dev-server checks, and a Netlify
> deploy/preview check for form registration). Tasks below specify manual test
> steps rather than automated test files. Do **not** introduce a test framework
> — that is out of scope for this spec.

## Tasks

### Task 1: Add bilingual `contact.form.*` locale strings `[S]`

**Goal**: Add all user-facing form strings to both locale files under
`contact.form.*` so every label, placeholder, validation error, and status
message is available in EN and IT.

**Files**:

| File              | Action | Description                                                |
| ----------------- | ------ | ---------------------------------------------------------- |
| `locales/en.json` | modify | Add `form` object inside existing `contact` block          |
| `locales/it.json` | modify | Add matching `form` object inside existing `contact` block |

**Reuse**:

| File                           | What to reuse                                |
| ------------------------------ | -------------------------------------------- |
| `locales/en.json` / `it.json`  | Existing `contact` block structure & tone    |
| `contexts/LanguageContext.tsx` | `t()` dot-notation + `{{var}}` interpolation |

**Steps**:

1. In both files, inside the existing `contact` object (alongside `title`,
   `intro`, `methods_intro`, `linkedin_hint`), add a `form` object with the
   keys below. Keep IT translations natural, matching the existing informal tone.
2. Suggested keys (finalise exact wording during implementation):
   - `heading`, `name_label`, `name_placeholder`, `email_label`,
     `email_placeholder`, `message_label`, `message_placeholder`
   - `submit`, `submitting`
   - `success`, `error`
   - `errors.name_required`, `errors.email_required`, `errors.email_invalid`,
     `errors.message_required`, `errors.message_too_short`
3. Ensure both files have identical key sets (only values differ) to avoid
   `t()` falling back to raw keys in one language.

**Tests** (manual):

- After Task 3, toggle EN/IT via the language switcher and confirm every string
  renders translated (no raw dot-notation keys appear).

**Acceptance criteria covered**: "All new user-facing strings exist in both
`locales/en.json` and `locales/it.json` under `contact.form.*`, and render in
both languages."

**Commit**: `feat(i18n): add bilingual contact form strings`

---

### Task 2: Add static Netlify form-detection HTML in `public/` `[S]`

**Goal**: Provide a plain static HTML form that Netlify's build-time parser can
detect, so the form is registered at deploy time despite the React form being
client-rendered.

**Files**:

| File                  | Action | Description                                      |
| --------------------- | ------ | ------------------------------------------------ |
| `public/__forms.html` | create | Minimal static HTML page with the detection form |

**Reuse**:

| File                    | What to reuse                                                  |
| ----------------------- | -------------------------------------------------------------- |
| `next.config.js`        | `output: 'export'` copies `public/*` into `out/` automatically |
| `scripts/postbuild.mjs` | postbuild only runs RSS; it will not remove `public/` files    |

**Steps**:

1. Create `public/__forms.html` — a bare `<html>` document containing a single
   `<form name="contact" data-netlify="true" netlify-honeypot="bot-field" hidden>`.
2. Include exactly the fields the React form posts, with matching `name`
   attributes: `form-name` (hidden, value `contact`), `name`, `email`,
   `message`, and the honeypot `bot-field`.
3. Confirm the form `name` (`contact`) is the single source of truth reused by
   the React form in Task 3 and the AJAX body in Task 4.

**Tests** (manual):

- Run `npm run build` and confirm `out/__forms.html` exists and contains the
  form markup (static export copies `public/`).
- On a Netlify deploy/preview, confirm a `contact` form appears under
  Site → Forms (deploy-time verification; note in the report if not deployable
  during implementation).

**Acceptance criteria covered**: "A static HTML detection form exists under
`public/` with matching field names and `data-netlify="true"`, and ends up in
the deployed `out/` directory."

**Commit**: `feat(contact): add static netlify form-detection html`

---

### Task 3: Build `ContactForm` markup, fields, and glass styling `[M]`

**Goal**: Create the client component with the form structure — Name, Email,
Message, hidden honeypot, hidden `form-name` — styled to match the
glassmorphism design and `@tailwindcss/forms`, with full accessibility markup.
No submission/validation logic yet (added in Task 4).

**Files**:

| File                                 | Action | Description                            |
| ------------------------------------ | ------ | -------------------------------------- |
| `components/contact/ContactForm.tsx` | create | Client component rendering the form UI |

**Reuse**:

| File                                         | What to reuse                                                                                                                                |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/contact/ContactMethods.tsx`      | `'use client'` + `useLanguage()`/`t()` pattern; glass card classes (`glass-bg`, `backdrop-blur`, rounded border, shadow, fadeInUp animation) |
| `contexts/LanguageContext.tsx`               | `useLanguage()` hook for `t()`                                                                                                               |
| `css/tailwind.css`                           | `glass-bg` utility, OKLCH `--color-primary-*` tokens, existing focus-outline styles                                                          |
| `@tailwindcss/forms` (in `css/tailwind.css`) | Base form-control styling                                                                                                                    |

**Steps**:

1. Create `components/contact/ContactForm.tsx` as a `'use client'` component
   using `useLanguage()` for `t()`.
2. Render a glass card matching `ContactMethods.tsx` styling, containing a
   `<form name="contact">` with:
   - Hidden `form-name` input (value `contact`).
   - Honeypot: a visually-hidden, non-focusable wrapper containing
     `<input name="bot-field" tabIndex={-1} autoComplete="off">` with
     `aria-hidden="true"` (hidden from sighted users and keyboard).
   - Name (`text`), Email (`type="email"`), Message (`textarea`), each with an
     associated `<label htmlFor>` and localized label/placeholder from Task 1.
3. Add accessibility scaffolding: stable `id`s for each field, `aria-invalid`
   and `aria-describedby` wiring to per-field error `<p>` elements (rendered
   conditionally, empty for now), and a submit `<button type="submit">` with
   localized label.
4. Reserve a status region: a `<div role="status" aria-live="polite">` for the
   success/error banner (empty for now; populated in Task 4).
5. Ensure visible focus states (rely on existing global focus-outline in
   `css/tailwind.css`; add Tailwind focus classes where needed).

**Tests** (manual):

- Temporarily render the component (or wait for Task 5) and verify in dev
  (`npm run dev`) that fields, labels, and glass styling display correctly in
  light/dark and that the honeypot is not reachable via Tab.
- Run `npm run lint`.

**Acceptance criteria covered**: component renders form with Name/Email/Message

- hidden honeypot + hidden `form-name`; labels present; `aria-invalid`/
  `aria-describedby` wiring; live region; glassmorphism + `@tailwindcss/forms`;
  honeypot hidden and not focusable.

**Commit**: `feat(contact): add contact form component markup and styling`

---

### Task 4: Add validation, AJAX submission, and success/error states `[M]`

**Goal**: Wire up client-side validation, the Netlify AJAX POST, in-flight
disabled state, and inline bilingual success/error handling in `ContactForm`.

**Files**:

| File                                 | Action | Description                                      |
| ------------------------------------ | ------ | ------------------------------------------------ |
| `components/contact/ContactForm.tsx` | modify | Add state, validation, submit handler, status UI |

**Reuse**:

| File                           | What to reuse                                 |
| ------------------------------ | --------------------------------------------- |
| `contexts/LanguageContext.tsx` | `t()` for reactive validation/status messages |
| Task 1 locale keys             | `errors.*`, `success`, `error`, `submitting`  |

**Steps**:

1. Add React state for field values, per-field errors, submission status
   (`idle | submitting | success | error`).
2. Validation (on submit and on blur), all trimmed:
   - Name: required (non-empty after trim).
   - Email: required + basic format check (simple regex, e.g. `/^\S+@\S+\.\S+$/`).
   - Message: required + minimum length 10.
   - Set `aria-invalid` and populate `aria-describedby` error text via `t()`.
3. On valid submit, build an `application/x-www-form-urlencoded` body with
   `URLSearchParams` including `form-name=contact`, the three fields, and
   `bot-field`; `fetch('/', { method: 'POST', headers, body })`.
4. While in flight: set status `submitting`, disable the submit button (show
   `submitting` label), prevent duplicate submits.
5. On 2xx: set status `success`, replace the form body with the localized
   thank-you message in the live region (no navigation).
6. On network error or non-2xx: set status `error`, show the localized error
   banner, keep entered values for retry, re-enable submit.
7. Ensure all messages read from `t()` so they update reactively on EN/IT toggle.

**Tests** (manual):

- In `npm run dev`: submit empty/whitespace fields → per-field errors appear;
  invalid email → email error; short message → min-length error.
- Simulate success/failure (e.g. via network throttling/offline in devtools) →
  confirm inline success and error states, disabled button while pending, and
  that values persist on error.
- Toggle EN/IT while errors/status are visible → messages re-render translated.

**Acceptance criteria covered**: valid submit AJAX POST + inline success;
failed submit inline error + preserved values; validation rules
(required/format/min-length) with inline per-field errors; double-submit
prevention; language-switch reactivity.

**Commit**: `feat(contact): add validation and netlify ajax submission`

---

### Task 5: Render `ContactForm` on the contact page `[S]`

**Goal**: Place `ContactForm` above the existing `ContactMethods` on
`/contact`, keeping `ContactIntro` and `ContactMethods` unchanged.

**Files**:

| File                   | Action | Description                                            |
| ---------------------- | ------ | ------------------------------------------------------ |
| `app/contact/page.tsx` | modify | Import and render `ContactForm` above `ContactMethods` |

**Reuse**:

| File                   | What to reuse                                                     |
| ---------------------- | ----------------------------------------------------------------- |
| `app/contact/page.tsx` | Existing `SectionContainer` + section layout; `allAuthors` lookup |

**Steps**:

1. Import `ContactForm` from `@/components/contact/ContactForm`.
2. Render it inside the existing `<section>` between `ContactIntro` and
   `ContactMethods`, so the form is the primary CTA and email/LinkedIn remain
   below.
3. Leave `ContactIntro` and `ContactMethods` (and the `author` email/linkedin
   props) untouched.

**Tests** (manual):

- `npm run dev`: confirm order is Intro → Form → Methods, and the existing
  email/LinkedIn card still renders beneath the form.
- `npm run build` succeeds (static export).

**Acceptance criteria covered**: "`app/contact/page.tsx` renders `ContactForm`
above the existing `ContactMethods`; the email and LinkedIn methods still
display beneath the form."

**Commit**: `feat(contact): render contact form on contact page`

---

### Task 6: Verify CSP permits the same-origin Netlify POST `[S]`

**Goal**: Confirm the AJAX POST is not blocked by the site's CSP; add a
`form-action 'self'` directive only if verification shows it is needed.

**Files**:

| File             | Action             | Description                                         |
| ---------------- | ------------------ | --------------------------------------------------- |
| `next.config.js` | modify (if needed) | Add `form-action 'self'` to `ContentSecurityPolicy` |

**Reuse**:

| File             | What to reuse                                                               |
| ---------------- | --------------------------------------------------------------------------- |
| `next.config.js` | Existing `ContentSecurityPolicy` template (`connect-src *` already present) |

**Steps**:

1. Review the current CSP: `connect-src *` already permits the same-origin
   `fetch` POST; there is no `form-action` directive (so it falls back to
   `default-src 'self'`, which allows same-origin form submission).
2. In `npm run dev`/preview, submit the form and check the browser console for
   any CSP violation on the POST.
3. If — and only if — a CSP violation is observed, add `form-action 'self';`
   to the `ContentSecurityPolicy` string in `next.config.js`. Otherwise leave
   CSP unchanged and note that verification passed.
4. Note: `next.config.js` `headers()` do not apply to static-export output on
   Netlify (headers come from Netlify), so this is primarily a dev-time
   verification; document the finding in the implementation report.

**Tests** (manual):

- Submit the form in the browser; confirm no CSP error in console and the POST
  reaches the network.

**Acceptance criteria covered**: "The CSP in `next.config.js` is verified to
permit the same-origin AJAX POST; if a `form-action` directive is introduced,
it allows `'self'`."

**Commit**: `chore(security): verify csp allows contact form post`

> If no change to `next.config.js` is required, fold this verification note into
> Task 4's commit instead of creating an empty commit.

---

**Task ordering**: Task 1 (locale strings) and Task 2 (static HTML) are
independent and can be done first in any order. Task 3 depends on Task 1
(uses `t()` keys). Task 4 depends on Task 3. Task 5 depends on Task 3
(component must exist). Task 6 depends on Task 4/5 (needs a working submit to
verify). Recommended order: 1 → 2 → 3 → 4 → 5 → 6.

## Edge Cases & Error Handling

- **JavaScript disabled**: React AJAX will not run; the email/LinkedIn methods
  below remain a working fallback. The static `public/__forms.html` handles
  Netlify detection only. (Tasks 2, 5)
- **Honeypot filled (bot)**: Netlify handles as spam; UI shows normal success,
  no trap signalling. (Tasks 3, 4)
- **Network failure / offline / non-2xx**: Inline error state, values
  preserved, retry allowed. (Task 4)
- **Double submit**: Submit disabled while `submitting`. (Task 4)
- **Language switched mid-session**: All strings via `t()` re-render. (Tasks 1, 4)
- **Empty/whitespace-only fields**: Trimmed and treated invalid. (Task 4)
- **Netlify form not detected**: Mitigated by static detection form; verified at
  deploy time. (Task 2)

## Verification

1. `npm run lint` passes.
2. `npm run build` succeeds and `out/__forms.html` contains the detection form.
3. `npm run dev`: on `/contact`, confirm order Intro → Form → Methods;
   glassmorphism styling in light/dark; honeypot not Tab-reachable.
4. Validation: empty/whitespace, invalid email, and too-short message each show
   the correct inline per-field error; submit is blocked while invalid.
5. Submission: successful POST shows inline bilingual thank-you (no navigation);
   simulated failure shows inline bilingual error with values preserved and
   button disabled while pending.
6. Toggle EN/IT with errors/status visible → messages re-render translated; no
   raw dot-notation keys appear in either language.
7. No CSP violation on the POST in the browser console.
8. (Deploy-time) On a Netlify preview, a `contact` form appears under
   Site → Forms and a test submission is captured.
