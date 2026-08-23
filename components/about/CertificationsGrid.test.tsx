import { describe, it, expect, afterEach, vi } from 'vitest'
import { renderWithProviders, screen, waitFor, within } from '../../test/renderWithProviders'
import { CertificationsGrid } from './CertificationsGrid'
import { type Certification } from './certificationGrouping'
import en from '@/locales/en.json'
import itLocale from '@/locales/it.json'

/**
 * Characterisation tests for `CertificationsGrid` — the About-page credential
 * wall with a "group by" radiogroup and per-card expiry badges.
 *
 * What the tests are shaped by:
 *
 * - **Locale arrives in an effect.** `LanguageProvider` applies the seeded
 *   `lightstimulus.lang` preference on mount, so all copy assertions are async.
 * - **The grouping mode also hydrates in an effect.** State starts at `'year'`
 *   and a saved `lightstimulus.certGrouping` is applied on mount, so a seeded
 *   preference must be written *before* rendering and awaited afterwards.
 * - **Grouping itself is delegated** to `groupCertifications`, which has its
 *   own unit tests (`certificationGrouping.test.ts`). Here we only assert that
 *   the component renders the group headings the module produces for each mode.
 * - **Dates.** `getExpiryInfo` compares against `new Date()`, so date-dependent
 *   tests freeze the clock. Formatted labels come from `Intl.DateTimeFormat`,
 *   whose exact output is ICU/locale-version dependent — only stable substrings
 *   (the year) are asserted.
 *
 * ### Time-zone caution
 * A date-only ISO string (`'2029-04-21'`) is parsed as **UTC midnight**, which
 * is the previous local day in negative-offset zones. That is irrelevant for
 * expiries years away, but it would flip the "expires exactly today" boundary
 * case, so that fixture uses a local-time string (`'…T00:00:00'`) instead.
 */

const COPY = { en: en.about.certifications, it: itLocale.about.certifications }

/** A fixed "now" for every date-dependent test. */
const NOW = new Date('2026-06-15T12:00:00Z')

/** Build a certification with only the fields a test cares about. */
function cert(overrides: Partial<Certification> & { title: string }): Certification {
  return { issuer: 'Acme', year: 2024, ...overrides }
}

/** Two badges that split differently under each grouping mode. */
const TWO_MODES_FIXTURE: Certification[] = [
  cert({ title: 'Solutions Architect', issuer: 'Amazon Web Services', year: 2024 }),
  cert({ title: 'ITIL 4 Foundation', issuer: 'AXELOS', year: 2025 }),
]

/** Freeze `Date` only — leaving timers real keeps `userEvent` usable. */
function freezeClock() {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
}

/** The radiogroup, once the locale effect has applied its label. */
async function findRadioGroup(locale: 'en' | 'it' = 'en') {
  return screen.findByRole('radiogroup', { name: COPY[locale].groupBy })
}

/** Ordered `[label, aria-checked, tabIndex]` triples for the two options. */
function optionState(group: HTMLElement) {
  return within(group)
    .getAllByRole('radio')
    .map((radio) => [radio.textContent, radio.getAttribute('aria-checked'), radio.tabIndex])
}

/** The rendered group headings, in order, without their counts. */
function groupHeadings() {
  return screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
}

afterEach(() => {
  vi.useRealTimers()
})

describe('CertificationsGrid', () => {
  describe('empty guard', () => {
    it('renders nothing when there are no certifications', () => {
      const { container } = renderWithProviders(<CertificationsGrid items={[]} />)

      // next-themes injects its no-flash <script> into the render container, so
      // the container is never literally empty; assert the component added
      // nothing of its own.
      expect(Array.from(container.children).map((node) => node.tagName)).toEqual(['SCRIPT'])
      expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })
  })

  describe('section chrome', () => {
    it('renders the translated section title in English', async () => {
      renderWithProviders(<CertificationsGrid items={TWO_MODES_FIXTURE} />, { locale: 'en' })

      expect(
        await screen.findByRole('heading', { level: 2, name: COPY.en.title })
      ).toBeInTheDocument()
    })

    it('renders the translated section title in Italian', async () => {
      renderWithProviders(<CertificationsGrid items={TWO_MODES_FIXTURE} />, { locale: 'it' })

      expect(
        await screen.findByRole('heading', { level: 2, name: COPY.it.title })
      ).toBeInTheDocument()
    })

    it('announces group changes politely', async () => {
      const { container } = renderWithProviders(<CertificationsGrid items={TWO_MODES_FIXTURE} />)

      await screen.findByRole('radiogroup')
      expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument()
    })
  })

  describe('radiogroup', () => {
    it('exposes exactly two radio options', async () => {
      renderWithProviders(<CertificationsGrid items={TWO_MODES_FIXTURE} />)

      const group = await findRadioGroup()
      expect(within(group).getAllByRole('radio')).toHaveLength(2)
    })

    it('labels the options with the translated mode names (EN)', async () => {
      renderWithProviders(<CertificationsGrid items={TWO_MODES_FIXTURE} />, { locale: 'en' })

      const group = await findRadioGroup('en')
      expect(
        within(group)
          .getAllByRole('radio')
          .map((r) => r.textContent)
      ).toEqual([COPY.en.byYear, COPY.en.byIssuer])
    })

    it('labels the options with the translated mode names (IT)', async () => {
      renderWithProviders(<CertificationsGrid items={TWO_MODES_FIXTURE} />, { locale: 'it' })

      const group = await findRadioGroup('it')
      expect(
        within(group)
          .getAllByRole('radio')
          .map((r) => r.textContent)
      ).toEqual([COPY.it.byYear, COPY.it.byIssuer])
    })

    it('checks "Year" and gives it the only tab stop by default', async () => {
      renderWithProviders(<CertificationsGrid items={TWO_MODES_FIXTURE} />, { locale: 'en' })

      const group = await findRadioGroup('en')
      expect(optionState(group)).toEqual([
        [COPY.en.byYear, 'true', 0],
        [COPY.en.byIssuer, 'false', -1],
      ])
    })

    it('renders the options as non-submitting buttons', async () => {
      renderWithProviders(<CertificationsGrid items={TWO_MODES_FIXTURE} />)

      const group = await findRadioGroup()
      for (const radio of within(group).getAllByRole('radio')) {
        expect(radio).toHaveAttribute('type', 'button')
      }
    })
  })

  describe('hydrating the saved grouping preference', () => {
    it('starts in issuer mode when "issuer" was saved', async () => {
      window.localStorage.setItem('lightstimulus.certGrouping', 'issuer')

      renderWithProviders(<CertificationsGrid items={TWO_MODES_FIXTURE} />, { locale: 'en' })

      const group = await findRadioGroup('en')
      await waitFor(() =>
        expect(optionState(group)).toEqual([
          [COPY.en.byYear, 'false', -1],
          [COPY.en.byIssuer, 'true', 0],
        ])
      )
      expect(groupHeadings()).toEqual(['Amazon Web Services (1)', 'AXELOS (1)'])
    })

    it('starts in year mode when "year" was saved', async () => {
      window.localStorage.setItem('lightstimulus.certGrouping', 'year')

      renderWithProviders(<CertificationsGrid items={TWO_MODES_FIXTURE} />, { locale: 'en' })

      const group = await findRadioGroup('en')
      expect(within(group).getByRole('radio', { name: COPY.en.byYear })).toHaveAttribute(
        'aria-checked',
        'true'
      )
    })

    it('ignores an unrecognised saved value and falls back to year', async () => {
      window.localStorage.setItem('lightstimulus.certGrouping', 'not-a-mode')

      renderWithProviders(<CertificationsGrid items={TWO_MODES_FIXTURE} />, { locale: 'en' })

      const group = await findRadioGroup('en')
      expect(optionState(group)).toEqual([
        [COPY.en.byYear, 'true', 0],
        [COPY.en.byIssuer, 'false', -1],
      ])
    })
  })

  describe('selecting a mode with the pointer', () => {
    it('checks the clicked option and moves the tab stop', async () => {
      const { user } = renderWithProviders(<CertificationsGrid items={TWO_MODES_FIXTURE} />, {
        locale: 'en',
      })
      const group = await findRadioGroup('en')

      await user.click(within(group).getByRole('radio', { name: COPY.en.byIssuer }))

      expect(optionState(group)).toEqual([
        [COPY.en.byYear, 'false', -1],
        [COPY.en.byIssuer, 'true', 0],
      ])
    })

    it('persists the selection to lightstimulus.certGrouping', async () => {
      const { user } = renderWithProviders(<CertificationsGrid items={TWO_MODES_FIXTURE} />, {
        locale: 'en',
      })
      const group = await findRadioGroup('en')

      await user.click(within(group).getByRole('radio', { name: COPY.en.byIssuer }))
      expect(window.localStorage.getItem('lightstimulus.certGrouping')).toBe('issuer')

      await user.click(within(group).getByRole('radio', { name: COPY.en.byYear }))
      expect(window.localStorage.getItem('lightstimulus.certGrouping')).toBe('year')
    })

    it('re-selecting the checked option is idempotent', async () => {
      const { user } = renderWithProviders(<CertificationsGrid items={TWO_MODES_FIXTURE} />, {
        locale: 'en',
      })
      const group = await findRadioGroup('en')

      await user.click(within(group).getByRole('radio', { name: COPY.en.byYear }))

      expect(optionState(group)).toEqual([
        [COPY.en.byYear, 'true', 0],
        [COPY.en.byIssuer, 'false', -1],
      ])
      expect(window.localStorage.getItem('lightstimulus.certGrouping')).toBe('year')
    })
  })

  describe('roving keyboard navigation', () => {
    /** Focus the checked option and hand back the group + option list. */
    async function focusRadioGroup() {
      const view = renderWithProviders(<CertificationsGrid items={TWO_MODES_FIXTURE} />, {
        locale: 'en',
      })
      const group = await findRadioGroup('en')
      const radios = within(group).getAllByRole('radio')
      radios[0].focus()
      return { ...view, group, radios }
    }

    it.each(['{ArrowRight}', '{ArrowDown}'])('%s advances to the next option', async (key) => {
      const { user, group, radios } = await focusRadioGroup()

      await user.keyboard(key)

      expect(optionState(group)).toEqual([
        [COPY.en.byYear, 'false', -1],
        [COPY.en.byIssuer, 'true', 0],
      ])
      expect(radios[1]).toHaveFocus()
    })

    it.each(['{ArrowLeft}', '{ArrowUp}'])(
      '%s retreats, wrapping to the last option',
      async (key) => {
        const { user, group, radios } = await focusRadioGroup()

        await user.keyboard(key)

        expect(optionState(group)).toEqual([
          [COPY.en.byYear, 'false', -1],
          [COPY.en.byIssuer, 'true', 0],
        ])
        expect(radios[1]).toHaveFocus()
      }
    )

    it('wraps forward from the last option back to the first', async () => {
      const { user, group, radios } = await focusRadioGroup()

      await user.keyboard('{ArrowRight}')
      await user.keyboard('{ArrowRight}')

      expect(optionState(group)).toEqual([
        [COPY.en.byYear, 'true', 0],
        [COPY.en.byIssuer, 'false', -1],
      ])
      expect(radios[0]).toHaveFocus()
    })

    it('wraps backward from the first option to the last and back', async () => {
      const { user, group, radios } = await focusRadioGroup()

      await user.keyboard('{ArrowUp}')
      await user.keyboard('{ArrowUp}')

      expect(optionState(group)).toEqual([
        [COPY.en.byYear, 'true', 0],
        [COPY.en.byIssuer, 'false', -1],
      ])
      expect(radios[0]).toHaveFocus()
    })

    it('persists the mode reached by arrow keys', async () => {
      const { user } = await focusRadioGroup()

      await user.keyboard('{ArrowDown}')

      expect(window.localStorage.getItem('lightstimulus.certGrouping')).toBe('issuer')
    })

    it('regroups the cards as the arrow keys move the selection', async () => {
      const { user } = await focusRadioGroup()
      expect(groupHeadings()).toEqual(['2025 (1)', '2024 (1)'])

      await user.keyboard('{ArrowRight}')

      expect(groupHeadings()).toEqual(['Amazon Web Services (1)', 'AXELOS (1)'])
    })

    it('Enter selects the focused option', async () => {
      const { user, group, radios } = await focusRadioGroup()
      // Move focus to the unchecked option without selecting it.
      radios[1].focus()

      await user.keyboard('{Enter}')

      expect(optionState(group)).toEqual([
        [COPY.en.byYear, 'false', -1],
        [COPY.en.byIssuer, 'true', 0],
      ])
      expect(window.localStorage.getItem('lightstimulus.certGrouping')).toBe('issuer')
    })

    it('Space selects the focused option', async () => {
      const { user, group, radios } = await focusRadioGroup()
      radios[1].focus()

      await user.keyboard(' ')

      expect(optionState(group)).toEqual([
        [COPY.en.byYear, 'false', -1],
        [COPY.en.byIssuer, 'true', 0],
      ])
      expect(window.localStorage.getItem('lightstimulus.certGrouping')).toBe('issuer')
    })

    it('Enter on the already-checked option keeps it checked', async () => {
      const { user, group } = await focusRadioGroup()

      await user.keyboard('{Enter}')

      expect(optionState(group)).toEqual([
        [COPY.en.byYear, 'true', 0],
        [COPY.en.byIssuer, 'false', -1],
      ])
      expect(window.localStorage.getItem('lightstimulus.certGrouping')).toBe('year')
    })

    it('ignores unrelated keys', async () => {
      const { user, group } = await focusRadioGroup()

      await user.keyboard('{Escape}')
      await user.keyboard('a')
      await user.keyboard('{Home}')

      expect(optionState(group)).toEqual([
        [COPY.en.byYear, 'true', 0],
        [COPY.en.byIssuer, 'false', -1],
      ])
      expect(window.localStorage.getItem('lightstimulus.certGrouping')).toBeNull()
    })
  })

  describe('grouping (delegated to groupCertifications)', () => {
    const items: Certification[] = [
      cert({ title: 'AI Practitioner', issuer: 'Amazon Web Services', year: 2025 }),
      cert({ title: 'Solutions Architect', issuer: 'Amazon Web Services', year: 2024 }),
      cert({ title: 'ITIL 4 Foundation', issuer: 'AXELOS', year: 2025 }),
    ]

    it('renders one heading per year, newest first, with counts', async () => {
      renderWithProviders(<CertificationsGrid items={items} />, { locale: 'en' })

      await screen.findByRole('heading', { level: 2, name: COPY.en.title })
      expect(groupHeadings()).toEqual(['2025 (2)', '2024 (1)'])
    })

    it('renders one heading per issuer, alphabetically, with counts', async () => {
      const { user } = renderWithProviders(<CertificationsGrid items={items} />, { locale: 'en' })
      const group = await findRadioGroup('en')

      await user.click(within(group).getByRole('radio', { name: COPY.en.byIssuer }))

      expect(groupHeadings()).toEqual(['Amazon Web Services (2)', 'AXELOS (1)'])
    })

    it('renders every badge title exactly once in either mode', async () => {
      const { user } = renderWithProviders(<CertificationsGrid items={items} />, { locale: 'en' })
      const group = await findRadioGroup('en')

      const titles = () => screen.getAllByRole('heading', { level: 4 }).map((h) => h.textContent)
      expect(titles().sort()).toEqual(items.map((i) => i.title).sort())

      await user.click(within(group).getByRole('radio', { name: COPY.en.byIssuer }))
      expect(titles().sort()).toEqual(items.map((i) => i.title).sort())
    })

    it('shows the issuer and year under each title', async () => {
      renderWithProviders(<CertificationsGrid items={[items[0]]} />, { locale: 'en' })

      await screen.findByRole('heading', { level: 4, name: 'AI Practitioner' })
      expect(screen.getByText('Amazon Web Services · 2025')).toBeInTheDocument()
    })

    it('labels the undated bucket with the localised "other" copy (EN)', async () => {
      const undated = [
        cert({ title: 'Team Solution Design', year: undefined as unknown as number }),
      ]

      renderWithProviders(<CertificationsGrid items={undated} />, { locale: 'en' })

      expect(
        await screen.findByRole('heading', { level: 3, name: `${COPY.en.other} (1)` })
      ).toBeInTheDocument()
    })

    it('labels the undated bucket with the localised "other" copy (IT)', async () => {
      const undated = [
        cert({ title: 'Team Solution Design', year: undefined as unknown as number }),
      ]

      renderWithProviders(<CertificationsGrid items={undated} />, { locale: 'it' })

      expect(
        await screen.findByRole('heading', { level: 3, name: `${COPY.it.other} (1)` })
      ).toBeInTheDocument()
    })
  })

  describe('card extras', () => {
    it('renders the credential link with the translated copy when a url exists', async () => {
      const items = [cert({ title: 'A', url: 'https://www.credly.com/badges/abc/public_url' })]

      renderWithProviders(<CertificationsGrid items={items} />, { locale: 'en' })

      const link = await screen.findByRole('link', { name: COPY.en.view })
      expect(link).toHaveAttribute('href', 'https://www.credly.com/badges/abc/public_url')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noreferrer')
    })

    it('omits the credential link when there is no url', async () => {
      renderWithProviders(<CertificationsGrid items={[cert({ title: 'A' })]} />, { locale: 'en' })

      await screen.findByRole('heading', { level: 4, name: 'A' })
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('uses the issuer as the badge image alt text', async () => {
      const items = [
        cert({
          title: 'A',
          issuer: 'AXELOS',
          image: '/static/images/certifications/itil-4-foundation.png',
        }),
      ]

      renderWithProviders(<CertificationsGrid items={items} />, { locale: 'en' })

      expect(await screen.findByRole('img', { name: 'AXELOS' })).toBeInTheDocument()
    })

    it('omits the image when the badge has none', async () => {
      renderWithProviders(<CertificationsGrid items={[cert({ title: 'A' })]} />, { locale: 'en' })

      await screen.findByRole('heading', { level: 4, name: 'A' })
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
  })

  describe('expiry info (frozen clock at 2026-06-15)', () => {
    it('shows the localised "expires" copy and year for a future expiry (EN)', async () => {
      freezeClock()

      renderWithProviders(
        <CertificationsGrid items={[cert({ title: 'A', expiryDate: '2029-04-21' })]} />,
        { locale: 'en' }
      )

      // The exact Intl month abbreviation is ICU-dependent; only the stable
      // parts of the label are asserted.
      const label = await screen.findByText(new RegExp(`^${COPY.en.expires}\\b`))
      expect(label.textContent).toContain('2029')
      expect(screen.queryByText(COPY.en.expired)).not.toBeInTheDocument()
    })

    it('shows the localised "expires" copy and year for a future expiry (IT)', async () => {
      freezeClock()

      renderWithProviders(
        <CertificationsGrid items={[cert({ title: 'A', expiryDate: '2029-04-21' })]} />,
        { locale: 'it' }
      )

      const label = await screen.findByText(new RegExp(`^${COPY.it.expires}\\b`))
      expect(label.textContent).toContain('2029')
      expect(screen.queryByText(COPY.it.expired)).not.toBeInTheDocument()
    })

    it('marks a past expiry as expired (EN)', async () => {
      freezeClock()

      renderWithProviders(
        <CertificationsGrid items={[cert({ title: 'A', expiryDate: '2020-01-15' })]} />,
        { locale: 'en' }
      )

      expect(await screen.findByText(COPY.en.expired)).toBeInTheDocument()
      expect(screen.queryByText(new RegExp(COPY.en.expires))).not.toBeInTheDocument()
    })

    it('marks a past expiry as expired (IT)', async () => {
      freezeClock()

      renderWithProviders(
        <CertificationsGrid items={[cert({ title: 'A', expiryDate: '2020-01-15' })]} />,
        { locale: 'it' }
      )

      expect(await screen.findByText(COPY.it.expired)).toBeInTheDocument()
    })

    it('treats an expiry equal to today as still valid', async () => {
      freezeClock()

      // Local-time form on purpose: a bare '2026-06-15' would parse as UTC
      // midnight and land on the previous local day west of Greenwich.
      renderWithProviders(
        <CertificationsGrid items={[cert({ title: 'A', expiryDate: '2026-06-15T00:00:00' })]} />,
        { locale: 'en' }
      )

      const label = await screen.findByText(new RegExp(`^${COPY.en.expires}\\b`))
      expect(label.textContent).toContain('2026')
      expect(screen.queryByText(COPY.en.expired)).not.toBeInTheDocument()
    })

    it('falls back to "no expiration" for an unparseable date (EN)', async () => {
      freezeClock()

      renderWithProviders(
        <CertificationsGrid items={[cert({ title: 'A', expiryDate: 'not-a-date' })]} />,
        { locale: 'en' }
      )

      expect(await screen.findByText(COPY.en.noExpiration)).toBeInTheDocument()
      expect(screen.queryByText(COPY.en.expired)).not.toBeInTheDocument()
    })

    it('falls back to "no expiration" for an unparseable date (IT)', async () => {
      freezeClock()

      renderWithProviders(
        <CertificationsGrid items={[cert({ title: 'A', expiryDate: 'not-a-date' })]} />,
        { locale: 'it' }
      )

      expect(await screen.findByText(COPY.it.noExpiration)).toBeInTheDocument()
    })

    it('shows "no expiration" when the field is absent', async () => {
      freezeClock()

      renderWithProviders(<CertificationsGrid items={[cert({ title: 'A' })]} />, { locale: 'en' })

      expect(await screen.findByText(COPY.en.noExpiration)).toBeInTheDocument()
    })

    it('derives each card independently', async () => {
      freezeClock()

      const items = [
        cert({ title: 'Valid', issuer: 'Acme', expiryDate: '2029-04-21' }),
        cert({ title: 'Gone', issuer: 'Beta', expiryDate: '2020-01-15' }),
        cert({ title: 'Forever', issuer: 'Gamma' }),
      ]
      renderWithProviders(<CertificationsGrid items={items} />, { locale: 'en' })

      await screen.findByText(COPY.en.expired)
      expect(screen.getAllByText(COPY.en.expired)).toHaveLength(1)
      expect(screen.getAllByText(COPY.en.noExpiration)).toHaveLength(1)
      expect(screen.getAllByText(new RegExp(`^${COPY.en.expires}\\b`))).toHaveLength(1)
    })
  })
})
