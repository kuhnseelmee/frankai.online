'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'

const interestOptions = [
  ['personal_access', 'Personal access'],
  ['workflow_solution', 'Workflow solution'],
  ['partnership', 'Partnership'],
  ['investment', 'Investment'],
  ['other', 'Other']
]

type FormState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; reference: string }
  | { status: 'error'; message: string }

export function ContactForm() {
  const [state, setState] = useState<FormState>({ status: 'idle' })

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState({ status: 'submitting' })

    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = Object.fromEntries(formData.entries())

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          consent: formData.get('consent') === 'on'
        })
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(typeof result.error === 'string' ? result.error : 'The enquiry could not be sent.')
      }
      form.reset()
      setState({ status: 'success', reference: result.reference ?? 'received' })
    } catch (error) {
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : 'The enquiry could not be sent.'
      })
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-grid">
        <label>
          <span>Name</span>
          <input name="name" autoComplete="name" required maxLength={120} />
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required maxLength={160} />
        </label>
      </div>
      <label>
        <span>Organisation</span>
        <input name="organisation" autoComplete="organization" maxLength={160} />
      </label>
      <label>
        <span>Interest type</span>
        <select name="interestType" required defaultValue="workflow_solution">
          {interestOptions.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Context</span>
        <textarea
          name="message"
          required
          maxLength={1600}
          rows={6}
          placeholder="Describe the workflow, access request or collaboration you want to discuss."
        />
      </label>
      <label className="consent-row">
        <input name="consent" type="checkbox" required />
        <span>I consent to FrankAI storing this enquiry so the request can be reviewed and answered.</span>
      </label>
      <label className="trap-field" aria-hidden="true">
        <span>Website</span>
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      {state.status === 'success' ? (
        <p className="form-alert form-alert-ok">Enquiry received. Reference: {state.reference}</p>
      ) : null}
      {state.status === 'error' ? (
        <p className="form-alert form-alert-error">{state.message}</p>
      ) : null}
      <button className="button" type="submit" disabled={state.status === 'submitting'}>
        {state.status === 'submitting' ? 'Sending...' : 'Send enquiry'}
      </button>
    </form>
  )
}
