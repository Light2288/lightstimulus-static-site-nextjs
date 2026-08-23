import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderWithProviders, screen, waitFor } from '../../test/renderWithProviders'
import { mockFetch, restoreFetch, parseFormBody } from '../../test/mockFetch'
import { ContactForm } from './ContactForm'
import en from '@/locales/en.json'

/**
 * Characterisation tests for the Netlify-backed contact form — the richest
 * interactive unit in the app.
 *
 * Covered: per-field validation rules and their sourced messages, the
 * blur-validates / change-clears interaction, the submit guard, the exact
 * `fetch` payload (including the honeypot), the success and error branches,
 * the re-entrancy guard, and the aria wiring.
 *
 * `fetch` is stubbed for every test so nothing leaves the process.
 */
const COPY = en.contact.form
const VALID = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'This message is definitely longer than ten characters.',
}

beforeEach(() => {
  mockFetch()
})

afterEach(() => {
  restoreFetch()
})

/** Render the form and return the interaction helpers plus field handles. */
function renderForm(locale: 'en' | 'it' = 'en') {
  const view = renderWithProviders(<ContactForm />, { locale })
  return {
    ...view,
    nameInput: () => screen.getByLabelText(COPY.name_label),
    emailInput: () => screen.getByLabelText(COPY.email_label),
    messageInput: () => screen.getByLabelText(COPY.message_label),
    submit: () => screen.getByRole('button', { name: COPY.submit }),
  }
}

/** Fill every field with valid content. */
async function fillValid(user: ReturnType<typeof renderForm>['user']) {
  await user.type(screen.getByLabelText(COPY.name_label), VALID.name)
  await user.type(screen.getByLabelText(COPY.email_label), VALID.email)
  await user.type(screen.getByLabelText(COPY.message_label), VALID.message)
}

describe('ContactForm', () => {
  describe('initial render', () => {
    it('renders the heading and all three fields', async () => {
      renderForm()

      expect(await screen.findByText(COPY.heading)).toBeInTheDocument()
      expect(screen.getByLabelText(COPY.name_label)).toBeInTheDocument()
      expect(screen.getByLabelText(COPY.email_label)).toBeInTheDocument()
      expect(screen.getByLabelText(COPY.message_label)).toBeInTheDocument()
    })

    it('disables native validation so the custom rules run', async () => {
      const { container } = renderForm()

      await waitFor(() => expect(container.querySelector('form')).toBeInTheDocument())
      expect(container.querySelector('form')).toHaveAttribute('novalidate')
    })

    it('carries the Netlify form name on the form and a hidden input', async () => {
      const { container } = renderForm()

      await waitFor(() =>
        expect(container.querySelector('form')).toHaveAttribute('name', 'contact')
      )
      expect(container.querySelector('input[name="form-name"]')).toHaveValue('contact')
    })

    it('hides the honeypot from sighted and assistive users', async () => {
      const { container } = renderForm()

      await waitFor(() =>
        expect(container.querySelector('input[name="bot-field"]')).toBeInTheDocument()
      )
      const wrapper = container.querySelector('p.hidden')
      expect(wrapper).toHaveAttribute('aria-hidden', 'true')
      expect(container.querySelector('input[name="bot-field"]')).toHaveAttribute('tabindex', '-1')
    })

    it('shows no validation errors before interaction', async () => {
      renderForm()

      await waitFor(() => expect(screen.getByText(COPY.heading)).toBeInTheDocument())
      expect(screen.queryByText(COPY.errors.name_required)).not.toBeInTheDocument()
      expect(screen.queryByText(COPY.errors.email_required)).not.toBeInTheDocument()
      expect(screen.queryByText(COPY.errors.message_required)).not.toBeInTheDocument()
    })
  })

  describe('validation on submit', () => {
    it('reports all three fields as required when empty', async () => {
      const { user, submit } = renderForm()

      await waitFor(() => expect(screen.getByText(COPY.heading)).toBeInTheDocument())
      await user.click(submit())

      expect(await screen.findByText(COPY.errors.name_required)).toBeInTheDocument()
      expect(screen.getByText(COPY.errors.email_required)).toBeInTheDocument()
      expect(screen.getByText(COPY.errors.message_required)).toBeInTheDocument()
    })

    it('does not call fetch when validation fails', async () => {
      const fetchMock = mockFetch()
      const { user, submit } = renderForm()

      await waitFor(() => expect(screen.getByText(COPY.heading)).toBeInTheDocument())
      await user.click(submit())

      await screen.findByText(COPY.errors.name_required)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('rejects a malformed email address', async () => {
      const { user, submit } = renderForm()

      await waitFor(() => expect(screen.getByText(COPY.heading)).toBeInTheDocument())
      await user.type(screen.getByLabelText(COPY.email_label), 'not-an-email')
      await user.click(submit())

      expect(await screen.findByText(COPY.errors.email_invalid)).toBeInTheDocument()
    })

    it('rejects a message shorter than ten characters', async () => {
      const { user, submit } = renderForm()

      await waitFor(() => expect(screen.getByText(COPY.heading)).toBeInTheDocument())
      await user.type(screen.getByLabelText(COPY.message_label), 'too short')
      await user.click(submit())

      expect(await screen.findByText(COPY.errors.message_too_short)).toBeInTheDocument()
    })

    it('accepts a message of exactly ten characters', async () => {
      const fetchMock = mockFetch()
      const { user, submit } = renderForm()

      await waitFor(() => expect(screen.getByText(COPY.heading)).toBeInTheDocument())
      await user.type(screen.getByLabelText(COPY.name_label), VALID.name)
      await user.type(screen.getByLabelText(COPY.email_label), VALID.email)
      await user.type(screen.getByLabelText(COPY.message_label), '0123456789')
      await user.click(submit())

      await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    })

    it('treats whitespace-only input as empty', async () => {
      const { user, submit } = renderForm()

      await waitFor(() => expect(screen.getByText(COPY.heading)).toBeInTheDocument())
      await user.type(screen.getByLabelText(COPY.name_label), '    ')
      await user.click(submit())

      expect(await screen.findByText(COPY.errors.name_required)).toBeInTheDocument()
    })
  })

  describe('blur and change behaviour', () => {
    it('validates a single field on blur', async () => {
      const { user } = renderForm()

      await waitFor(() => expect(screen.getByText(COPY.heading)).toBeInTheDocument())
      await user.click(screen.getByLabelText(COPY.name_label))
      await user.tab()

      expect(await screen.findByText(COPY.errors.name_required)).toBeInTheDocument()
      // Only the blurred field is validated.
      expect(screen.queryByText(COPY.errors.message_required)).not.toBeInTheDocument()
    })

    it('clears that field error as the user types', async () => {
      const { user } = renderForm()

      await waitFor(() => expect(screen.getByText(COPY.heading)).toBeInTheDocument())
      await user.click(screen.getByLabelText(COPY.name_label))
      await user.tab()
      await screen.findByText(COPY.errors.name_required)

      await user.type(screen.getByLabelText(COPY.name_label), 'A')

      await waitFor(() =>
        expect(screen.queryByText(COPY.errors.name_required)).not.toBeInTheDocument()
      )
    })

    it('leaves other field errors untouched while correcting one', async () => {
      const { user, submit } = renderForm()

      await waitFor(() => expect(screen.getByText(COPY.heading)).toBeInTheDocument())
      await user.click(submit())
      await screen.findByText(COPY.errors.name_required)

      await user.type(screen.getByLabelText(COPY.name_label), 'Ada')

      await waitFor(() =>
        expect(screen.queryByText(COPY.errors.name_required)).not.toBeInTheDocument()
      )
      expect(screen.getByText(COPY.errors.email_required)).toBeInTheDocument()
    })
  })

  describe('successful submission', () => {
    it('posts urlencoded data to the Netlify forms endpoint', async () => {
      const fetchMock = mockFetch()
      const { user, submit } = renderForm()

      await waitFor(() => expect(screen.getByText(COPY.heading)).toBeInTheDocument())
      await fillValid(user)
      await user.click(submit())

      await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce())
      const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
      expect(url).toBe('/__forms.html')
      expect(init.method).toBe('POST')
      expect(init.headers).toMatchObject({
        'Content-Type': 'application/x-www-form-urlencoded',
      })
    })

    it('sends the form name, trimmed values and an empty honeypot', async () => {
      const fetchMock = mockFetch()
      const { user, submit } = renderForm()

      await waitFor(() => expect(screen.getByText(COPY.heading)).toBeInTheDocument())
      await user.type(screen.getByLabelText(COPY.name_label), `  ${VALID.name}  `)
      await user.type(screen.getByLabelText(COPY.email_label), VALID.email)
      await user.type(screen.getByLabelText(COPY.message_label), VALID.message)
      await user.click(submit())

      await waitFor(() => expect(fetchMock).toHaveBeenCalled())
      const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
      expect(parseFormBody(init)).toEqual({
        'form-name': 'contact',
        name: VALID.name,
        email: VALID.email,
        message: VALID.message,
        'bot-field': '',
      })
    })

    it('replaces the form with a polite status panel', async () => {
      const { user, submit } = renderForm()

      await waitFor(() => expect(screen.getByText(COPY.heading)).toBeInTheDocument())
      await fillValid(user)
      await user.click(submit())

      const status = await screen.findByRole('status')
      expect(status).toHaveTextContent(COPY.success)
      expect(status).toHaveAttribute('aria-live', 'polite')
      expect(screen.queryByLabelText(COPY.name_label)).not.toBeInTheDocument()
    })
  })

  describe('failed submission', () => {
    it('shows the error panel when the response is not ok', async () => {
      mockFetch({ ok: false, status: 500 })
      const { user, submit } = renderForm()

      await waitFor(() => expect(screen.getByText(COPY.heading)).toBeInTheDocument())
      await fillValid(user)
      await user.click(submit())

      expect(await screen.findByText(COPY.error)).toBeInTheDocument()
    })

    it('shows the error panel when the request rejects', async () => {
      mockFetch({ reject: new Error('offline') })
      const { user, submit } = renderForm()

      await waitFor(() => expect(screen.getByText(COPY.heading)).toBeInTheDocument())
      await fillValid(user)
      await user.click(submit())

      expect(await screen.findByText(COPY.error)).toBeInTheDocument()
    })

    it('keeps the entered values so the user can retry', async () => {
      mockFetch({ ok: false, status: 500 })
      const { user, submit } = renderForm()

      await waitFor(() => expect(screen.getByText(COPY.heading)).toBeInTheDocument())
      await fillValid(user)
      await user.click(submit())

      await screen.findByText(COPY.error)
      expect(screen.getByLabelText(COPY.name_label)).toHaveValue(VALID.name)
      expect(screen.getByLabelText(COPY.message_label)).toHaveValue(VALID.message)
    })

    it('keeps the form visible after a failure', async () => {
      mockFetch({ ok: false, status: 500 })
      const { user, submit } = renderForm()

      await waitFor(() => expect(screen.getByText(COPY.heading)).toBeInTheDocument())
      await fillValid(user)
      await user.click(submit())

      await screen.findByText(COPY.error)
      expect(screen.getByRole('button', { name: COPY.submit })).toBeInTheDocument()
    })
  })

  describe('submission in flight', () => {
    it('disables the button and swaps its label while submitting', async () => {
      // A promise we control, so the submitting state can be observed.
      let release: () => void = () => {}
      const pending = new Promise<void>((resolve) => {
        release = resolve
      })
      globalThis.fetch = (async () => {
        await pending
        return { ok: true, status: 200, text: async () => '' } as unknown as Response
      }) as unknown as typeof fetch

      const { user, submit } = renderForm()
      await waitFor(() => expect(screen.getByText(COPY.heading)).toBeInTheDocument())
      await fillValid(user)
      await user.click(submit())

      const submitting = await screen.findByRole('button', { name: COPY.submitting })
      expect(submitting).toBeDisabled()

      release()
      await screen.findByRole('status')
    })

    it('ignores a second submit while one is in flight', async () => {
      let release: () => void = () => {}
      const pending = new Promise<void>((resolve) => {
        release = resolve
      })
      let calls = 0
      globalThis.fetch = (async () => {
        calls += 1
        await pending
        return { ok: true, status: 200, text: async () => '' } as unknown as Response
      }) as unknown as typeof fetch

      const { user, submit } = renderForm()
      await waitFor(() => expect(screen.getByText(COPY.heading)).toBeInTheDocument())
      await fillValid(user)
      await user.click(submit())
      await screen.findByRole('button', { name: COPY.submitting })

      // The button is disabled, so this click is a no-op — the guard also
      // protects against a programmatic re-submit.
      await user.click(screen.getByRole('button', { name: COPY.submitting }))

      expect(calls).toBe(1)
      release()
      await screen.findByRole('status')
    })
  })

  describe('accessibility wiring', () => {
    it('marks invalid fields and links them to their error message', async () => {
      const { user, submit } = renderForm()

      await waitFor(() => expect(screen.getByText(COPY.heading)).toBeInTheDocument())
      await user.click(submit())
      await screen.findByText(COPY.errors.name_required)

      const nameInput = screen.getByLabelText(COPY.name_label)
      expect(nameInput).toHaveAttribute('aria-invalid', 'true')
      expect(nameInput).toHaveAttribute('aria-describedby', 'name-error')
      expect(document.getElementById('name-error')).toHaveTextContent(COPY.errors.name_required)
    })

    it('leaves valid fields unmarked', async () => {
      const { user, submit } = renderForm()

      await waitFor(() => expect(screen.getByText(COPY.heading)).toBeInTheDocument())
      await user.type(screen.getByLabelText(COPY.name_label), VALID.name)
      await user.click(submit())

      await screen.findByText(COPY.errors.email_required)
      const nameInput = screen.getByLabelText(COPY.name_label)
      expect(nameInput).not.toHaveAttribute('aria-invalid')
      expect(nameInput).not.toHaveAttribute('aria-describedby')
    })

    it('wires the email and message errors to their own ids', async () => {
      const { user, submit } = renderForm()

      await waitFor(() => expect(screen.getByText(COPY.heading)).toBeInTheDocument())
      await user.click(submit())
      await screen.findByText(COPY.errors.email_required)

      expect(screen.getByLabelText(COPY.email_label)).toHaveAttribute(
        'aria-describedby',
        'email-error'
      )
      expect(screen.getByLabelText(COPY.message_label)).toHaveAttribute(
        'aria-describedby',
        'message-error'
      )
    })
  })

  describe('localisation', () => {
    it('renders Italian labels and errors under the Italian locale', async () => {
      const { user } = renderForm('it')
      const itCopy = (await import('@/locales/it.json')).default.contact.form

      expect(await screen.findByText(itCopy.heading)).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: itCopy.submit }))

      expect(await screen.findByText(itCopy.errors.name_required)).toBeInTheDocument()
    })
  })
})
