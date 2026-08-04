# Bilingual Netlify Contact Form

| Field       | Value                                                |
| ----------- | ---------------------------------------------------- |
| **Title**   | Bilingual Netlify Contact Form                       |
| **Type**    | feature                                              |
| **Scope**   | Contact page (`app/contact/`, `components/contact/`) |
| **Created** | 2026-08-04 00:00:00                                  |
| **Status**  | IMPLEMENTED                                          |

## Problem Statement

The `/contact` page currently offers only passive contact channels — an email
address and a LinkedIn link (rendered by `components/contact/ContactMethods.tsx`).
Visitors who want to reach out must leave the site to open their mail client or
LinkedIn. There is no way to send a message directly from the page, which adds
friction and loses visitors who would otherwise message in the moment.

The site is a fully static export (`next.config.js` sets `output: 'export'`) with
no server runtime, deployed on Netlify. This constrains any form solution to a
static-friendly backend — Netlify Forms — combined with client-side interactivity.

## Desired Outcome

The `/contact` page presents an accessible, bilingual (EN/IT) contact form as the
primary call to action, styled to match the site's glassmorphism design language.
The form submits to Netlify Forms via a client-side AJAX POST, shows inline
validation, and displays inline success/error states without leaving the page. The
existing email and LinkedIn methods remain on the page beneath the form as a
secondary option.

Layout and structure:

- A new client component `components/contact/ContactForm.tsx` renders the
  interactive form.
- `app/contact/page.tsx` renders `ContactForm` **above** the existing
  `ContactMethods` card. `ContactIntro` and `ContactMethods` remain unchanged in
  behaviour; the form is the primary CTA and the methods card is retained as a
  secondary channel below it.
- The form is visually consistent with the existing glass card
  (`glass-bg`, `backdrop-blur`, rounded border, OKLCH teal/amber theming) and uses
  the already-installed `@tailwindcss/forms` styling.

Fields:

- **Name** — text, required.
- **Email** — email, required, basic format validation.
- **Message** — textarea, required, minimum length (10 characters).
- **Honeypot** — hidden field (e.g. `bot-field`) for spam protection; must not be
  perceivable or focusable by real users.
- A hidden `form-name` field matching the Netlify form name.

Netlify integration (static export + client components):

- Because Netlify's build-time form detection parses the static HTML produced at
  deploy time — not client-rendered React DOM — a **plain static HTML form** with
  all the same fields and the same `name`/`form-name` is added under `public/`
  (e.g. `public/__forms.html` or an equivalent static HTML file that ends up in the
  `out/` publish directory). This static form carries the `data-netlify="true"` and
  honeypot attributes and exists solely so Netlify registers the form at deploy time.
- The React `ContactForm` submits via `fetch` (AJAX) using an
  `application/x-www-form-urlencoded` body whose `form-name` matches the registered
  form. The React form also carries `data-netlify`-style attributes for consistency,
  but detection relies on the static HTML form.

Submission & states:

- On submit, the form validates client-side; invalid fields show inline,
  per-field error messages and prevent submission.
- On valid submit, an AJAX POST is sent to the site origin. While in flight, the
  submit control shows a pending/disabled state.
- On success (2xx), the form is replaced/overlaid with a bilingual thank-you
  message; the page does not navigate.
- On failure (network error or non-2xx), a bilingual error message is shown and the
  user can retry without losing entered data.

Internationalisation:

- All user-facing strings (labels, placeholders, validation messages, submit label,
  pending label, success message, error message) are added to **both**
  `locales/en.json` and `locales/it.json`, nested under `contact.form.*`
  (e.g. `contact.form.name_label`, `contact.form.errors.email_invalid`,
  `contact.form.success`, `contact.form.error`). Strings are consumed via the
  existing `t()` from `contexts/LanguageContext.tsx`.

Accessibility:

- Every input has an associated `<label>`.
- Invalid fields use `aria-invalid` and link to their error via
  `aria-describedby`.
- Success and error banners use an appropriate live region
  (`role="status"` / `aria-live`).
- Visible focus states on all interactive elements; the form is fully operable by
  keyboard.

## Acceptance Criteria

- [ ] A new client component `components/contact/ContactForm.tsx` renders a form with
      Name, Email, and Message fields plus a hidden honeypot and hidden `form-name`.
- [ ] `app/contact/page.tsx` renders `ContactForm` above the existing
      `ContactMethods`; the email and LinkedIn methods still display beneath the form.
- [ ] A static HTML detection form exists under `public/` with matching field names
      and `data-netlify="true"`, and ends up in the deployed `out/` directory so
      Netlify registers the form at deploy time.
- [ ] Submitting a valid form performs an AJAX POST and, on success, shows an inline
      bilingual thank-you message without page navigation.
- [ ] A failed submission shows an inline bilingual error message and preserves the
      user's entered values for retry.
- [ ] Client-side validation enforces: Name required, Email required + valid format,
      Message required + minimum length; invalid fields show inline per-field errors.
- [ ] The honeypot field is present, hidden from sighted users, and not focusable via
      keyboard.
- [ ] All new user-facing strings exist in both `locales/en.json` and
      `locales/it.json` under `contact.form.*`, and render in both languages.
- [ ] The form matches the site's glassmorphism styling and uses `@tailwindcss/forms`.
- [ ] Inputs have labels; invalid fields expose `aria-invalid` + `aria-describedby`;
      success/error messages use a live region; focus states are visible and the form
      is keyboard-operable.
- [ ] The CSP in `next.config.js` is verified to permit the same-origin AJAX POST;
      if a `form-action` directive is introduced, it allows `'self'`.

## Edge Cases & Error Handling

- **JavaScript disabled**: AJAX submit will not run. The static/native form markup
  should degrade to a standard Netlify POST where feasible; at minimum the email and
  LinkedIn methods below remain available as a fallback channel.
- **Honeypot filled (bot)**: Submission is treated as spam by Netlify; the user-facing
  UI need not distinguish it from a normal success (avoid signalling the trap).
- **Network failure / offline**: Show the bilingual error state; do not clear the
  form; allow retry.
- **Non-2xx response from Netlify**: Treated the same as a failure — show error state.
- **Double submit**: Submit control is disabled while a request is in flight to prevent
  duplicate POSTs.
- **Language switched mid-session**: All labels, errors, and status messages update
  reactively via `t()` when the user toggles EN/IT.
- **Empty / whitespace-only fields**: Treated as invalid (trimmed before validation).
- **Netlify form not detected**: Documented as a known risk of static export; the
  static HTML detection form under `public/` is the mitigation.

## Dependencies & Constraints

- **Static export only** — `output: 'export'` in `next.config.js`; no server runtime,
  API routes, or server actions are available.
- **Netlify Forms** is the backend; form registration depends on Netlify's build-time
  HTML parsing, hence the static detection form.
- **Netlify redirects** — `netlify.toml` has a catch-all `/* -> /index.html` (200)
  SPA-style redirect; the plan must confirm this does not interfere with Netlify's
  form POST handling and that the static detection HTML is reachable/registered.
- **CSP** — `next.config.js` currently sets `connect-src *` (which should permit the
  same-origin fetch) and defines no `form-action` directive; verify the POST is
  allowed and, if adding `form-action`, include `'self'`.
- **i18n** — must use the existing custom client-side context
  (`contexts/LanguageContext.tsx`, `t()` dot-notation) backed by `locales/en.json`
  and `locales/it.json`; do not introduce Next.js built-in i18n or locale-prefixed
  URLs.
- **Styling** — glassmorphism utilities (`glass-bg`, `backdrop-blur`) and OKLCH
  teal/amber theming from `css/tailwind.css`; `@tailwindcss/forms` (already installed)
  for form control styling.
- Existing `ContactIntro.tsx` and `ContactMethods.tsx` behaviour is preserved.

## Out of Scope

- reCAPTCHA or any spam protection beyond the honeypot field.
- A dedicated `/contact/success` route or post-submit redirect (success is inline).
- Email autoresponders, notification routing, or Netlify Forms notification
  configuration in the Netlify dashboard.
- Storing/exporting submissions beyond what Netlify Forms provides by default.
- Adding new languages beyond the existing EN/IT.
- Changes to the email/LinkedIn methods themselves beyond their placement below the
  form.

## Notes

- Investigation confirmed: static export means Netlify cannot see the client-rendered
  React form at build time, so a static HTML detection form under `public/` is the
  chosen, reliable mechanism (per dialogue).
- Suggested locale key grouping under `contact.form.*`:
  labels (`name_label`, `email_label`, `message_label`), placeholders, `submit`,
  `submitting`, `success`, `error`, and `errors.*`
  (e.g. `errors.name_required`, `errors.email_required`, `errors.email_invalid`,
  `errors.message_required`, `errors.message_too_short`). Exact keys to be finalised
  during planning/implementation.
- The existing `contact` block in the locale files already holds `title`, `intro`,
  `methods_intro`, `linkedin_hint`; the new `contact.form.*` keys sit alongside them.
