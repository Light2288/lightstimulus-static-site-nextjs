'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

/** Netlify form name — must match public/__forms.html and the AJAX body. */
const FORM_NAME = 'contact'

/** Basic email format check (intentionally permissive). */
const EMAIL_RE = /^\S+@\S+\.\S+$/

type FieldName = 'name' | 'email' | 'message'
type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'
type FieldErrors = Partial<Record<FieldName, string>>

const shared =
  'w-full rounded-lg border border-white/30 bg-white/60 px-3 py-2 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:placeholder:text-gray-500'

const invalidRing = 'border-red-400 focus:border-red-500 focus:ring-red-500 dark:border-red-500/70'

export function ContactForm() {
  const { t } = useLanguage()

  const [values, setValues] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<SubmitStatus>('idle')

  const validateField = (field: FieldName, raw: string): string | undefined => {
    const value = raw.trim()
    switch (field) {
      case 'name':
        if (!value) return t('contact.form.errors.name_required')
        return undefined
      case 'email':
        if (!value) return t('contact.form.errors.email_required')
        if (!EMAIL_RE.test(value)) return t('contact.form.errors.email_invalid')
        return undefined
      case 'message':
        if (!value) return t('contact.form.errors.message_required')
        if (value.length < 10) return t('contact.form.errors.message_too_short')
        return undefined
    }
  }

  const validateAll = (): FieldErrors => {
    const next: FieldErrors = {}
    ;(Object.keys(values) as FieldName[]).forEach((field) => {
      const err = validateField(field, values[field])
      if (err) next[field] = err
    })
    return next
  }

  const handleChange =
    (field: FieldName) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }))
      // Clear an existing error as the user corrects the field.
      setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
    }

  const handleBlur = (field: FieldName) => () => {
    const err = validateField(field, values[field])
    setErrors((prev) => ({ ...prev, [field]: err }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === 'submitting') return

    const nextErrors = validateAll()
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setStatus('submitting')

    const form = e.currentTarget
    const honeypot = (form.elements.namedItem('bot-field') as HTMLInputElement | null)?.value ?? ''

    const body = new URLSearchParams({
      'form-name': FORM_NAME,
      name: values.name.trim(),
      email: values.email.trim(),
      message: values.message.trim(),
      'bot-field': honeypot,
    })

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })
      if (!res.ok) throw new Error(`Unexpected response: ${res.status}`)
      setStatus('success')
    } catch {
      // Keep entered values so the user can retry.
      setStatus('error')
    }
  }

  const describedBy = (field: FieldName) => (errors[field] ? `${field}-error` : undefined)

  return (
    <section className="glass-bg mx-auto mt-12 max-w-xl translate-y-1 animate-[fadeInUp_0.4s_ease-out_forwards] rounded-xl border border-white/20 p-6 opacity-0 shadow-md backdrop-blur dark:border-white/10">
      <h2 className="mb-6 text-center text-lg font-semibold text-gray-800 dark:text-gray-100">
        {t('contact.form.heading')}
      </h2>

      {status === 'success' ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border border-[var(--color-primary-300)] bg-[var(--color-primary-50)]/60 p-4 text-center text-sm text-[var(--color-primary-800)] dark:border-[var(--color-primary-700)] dark:bg-[var(--color-primary-900)]/40 dark:text-[var(--color-primary-100)]"
        >
          {t('contact.form.success')}
        </div>
      ) : (
        <form
          name={FORM_NAME}
          method="POST"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          noValidate
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          {/* Netlify hidden identifier */}
          <input type="hidden" name="form-name" value={FORM_NAME} />

          {/* Honeypot: hidden from sighted users and keyboard */}
          <p className="hidden" aria-hidden="true">
            <label>
              Do not fill this out if you are human:
              <input name="bot-field" tabIndex={-1} autoComplete="off" />
            </label>
          </p>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="contact-name"
              className="text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              {t('contact.form.name_label')}
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              value={values.name}
              onChange={handleChange('name')}
              onBlur={handleBlur('name')}
              placeholder={t('contact.form.name_placeholder')}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={describedBy('name')}
              className={`${shared} ${errors.name ? invalidRing : ''}`}
            />
            {errors.name && (
              <p id="name-error" className="text-xs text-red-600 dark:text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="contact-email"
              className="text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              {t('contact.form.email_label')}
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange('email')}
              onBlur={handleBlur('email')}
              placeholder={t('contact.form.email_placeholder')}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={describedBy('email')}
              className={`${shared} ${errors.email ? invalidRing : ''}`}
            />
            {errors.email && (
              <p id="email-error" className="text-xs text-red-600 dark:text-red-400">
                {errors.email}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="contact-message"
              className="text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              {t('contact.form.message_label')}
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              value={values.message}
              onChange={handleChange('message')}
              onBlur={handleBlur('message')}
              placeholder={t('contact.form.message_placeholder')}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={describedBy('message')}
              className={`${shared} resize-y ${errors.message ? invalidRing : ''}`}
            />
            {errors.message && (
              <p id="message-error" className="text-xs text-red-600 dark:text-red-400">
                {errors.message}
              </p>
            )}
          </div>

          {status === 'error' && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-lg border border-red-300 bg-red-50/70 p-3 text-sm text-red-700 dark:border-red-500/60 dark:bg-red-900/30 dark:text-red-300"
            >
              {t('contact.form.error')}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="bg-primary-600 hover:bg-primary-700 focus-visible:outline-primary-500 mt-2 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'submitting' ? t('contact.form.submitting') : t('contact.form.submit')}
          </button>
        </form>
      )}
    </section>
  )
}
