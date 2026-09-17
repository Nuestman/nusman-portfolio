import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'

type FormStatus = 'idle' | 'success' | 'error' | 'misconfigured'

type FormData = {
  name: string
  email: string
  phone: string
  organisation: string
  problem: string
  whoFor: string
  successLooksLike: string
  timeline: string
  budget: string
  website: string
}

const emptyForm: FormData = {
  name: '',
  email: '',
  phone: '',
  organisation: '',
  problem: '',
  whoFor: '',
  successLooksLike: '',
  timeline: '',
  budget: '',
  website: '',
}

function inboundUrl(): string {
  const fromEnv = import.meta.env.VITE_DESK_INBOUND_URL?.trim()
  if (fromEnv) {
    const base = fromEnv.replace(/\/$/, '')
    return base.endsWith('/api/inbound-lead')
      ? base
      : `${base}/api/inbound-lead`
  }
  if (import.meta.env.DEV) {
    return 'http://localhost:3000/api/inbound-lead'
  }
  return 'https://desk.nusman.dev/api/inbound-lead'
}

const StartProjectForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus('idle')
    setErrorMessage(null)

    const url = inboundUrl()
    if (!url) {
      setStatus('misconfigured')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          organisation: formData.organisation.trim() || undefined,
          problem: formData.problem.trim(),
          whoFor: formData.whoFor.trim(),
          successLooksLike: formData.successLooksLike.trim(),
          timeline: formData.timeline.trim() || undefined,
          budget: formData.budget.trim() || undefined,
          website: formData.website.trim() || undefined,
        }),
      })

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || 'Could not send your request.')
      }

      setStatus('success')
      setFormData(emptyForm)
    } catch (error) {
      console.error(error)
      setStatus('error')
      const message =
        error instanceof Error ? error.message : null
      const looksLikeNetwork =
        !message ||
        /failed to fetch|networkerror|load failed|network request failed/i.test(
          message,
        )
      setErrorMessage(
        looksLikeNetwork
          ? 'Could not reach the server. Check your connection and try again, or use Contact.'
          : message,
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const fieldClass =
    'w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors duration-200 placeholder:text-gray-500'

  return (
    <section className="py-20 pb-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="section-heading mb-6 text-dark-950">Start a project with me</h1>
          <p className="text-xl text-gray-700">
            Tell me what you need, and I&apos;ll get back to you soon.
            For a quick hello, use{' '}
            <Link to="/contact" className="text-gold-600 font-semibold hover:underline">
              Contact
            </Link>{' '}
            instead.
          </p>
        </motion.div>

        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6 md:p-8">
              {status === 'success' ? (
                <div className="space-y-4 text-center py-6">
                  <h2 className="text-2xl font-heading font-bold text-dark-950">
                    Got it — thanks
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    Your request is on my Desk. I&apos;ll review it and reach out soon,
                    usually within a business day.
                  </p>
                  <Button type="button" onClick={() => setStatus('idle')}>
                    Submit another
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="relative"
                  aria-busy={isSubmitting}
                >
                  <fieldset disabled={isSubmitting} className="space-y-6 border-0 p-0 m-0 min-w-0">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="start-name" className="block text-sm font-medium text-dark-950 mb-2">
                        Your name
                      </label>
                      <input
                        id="start-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        minLength={2}
                        maxLength={120}
                        autoComplete="name"
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="start-email" className="block text-sm font-medium text-dark-950 mb-2">
                        Email
                      </label>
                      <input
                        id="start-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        autoComplete="email"
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="start-phone" className="block text-sm font-medium text-dark-950 mb-2">
                        Phone <span className="text-gray-500 font-normal">(optional)</span>
                      </label>
                      <input
                        id="start-phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        autoComplete="tel"
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="start-organisation"
                        className="block text-sm font-medium text-dark-950 mb-2"
                      >
                        Organisation / Business <span className="text-gray-500 font-normal">(optional)</span>
                      </label>
                      <input
                        id="start-organisation"
                        type="text"
                        name="organisation"
                        value={formData.organisation}
                        onChange={handleInputChange}
                        maxLength={160}
                        autoComplete="organization"
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="start-problem" className="block text-sm font-medium text-dark-950 mb-2">
                      What&apos;s the problem?
                    </label>
                    <textarea
                      id="start-problem"
                      name="problem"
                      rows={3}
                      value={formData.problem}
                      onChange={handleInputChange}
                      required
                      minLength={10}
                      maxLength={2000}
                      placeholder="What needs to be built or fixed?"
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="start-who-for" className="block text-sm font-medium text-dark-950 mb-2">
                      Who is it for (the users)?
                    </label>
                    <textarea
                      id="start-who-for"
                      name="whoFor"
                      rows={2}
                      value={formData.whoFor}
                      onChange={handleInputChange}
                      required
                      minLength={5}
                      maxLength={500}
                      placeholder="e.g. your clinic staff, patients, customers, your own team"
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="start-success"
                      className="block text-sm font-medium text-dark-950 mb-2"
                    >
                      What does success look like?
                    </label>
                    <textarea
                      id="start-success"
                      name="successLooksLike"
                      rows={3}
                      value={formData.successLooksLike}
                      onChange={handleInputChange}
                      required
                      minLength={10}
                      maxLength={2000}
                      placeholder="How will you know it worked?"
                      className={fieldClass}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="start-timeline"
                        className="block text-sm font-medium text-dark-950 mb-2"
                      >
                        Timeline <span className="text-gray-500 font-normal">(optional)</span>
                      </label>
                      <input
                        id="start-timeline"
                        type="text"
                        name="timeline"
                        value={formData.timeline}
                        onChange={handleInputChange}
                        maxLength={200}
                        placeholder="e.g. this month, Q2, flexible"
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="start-budget"
                        className="block text-sm font-medium text-dark-950 mb-2"
                      >
                        Budget range <span className="text-gray-500 font-normal">(optional)</span>
                      </label>
                      <input
                        id="start-budget"
                        type="text"
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        maxLength={200}
                        placeholder="e.g. under $2k, open"
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  {/* Honeypot — leave empty */}
                  <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                    <label htmlFor="start-website">Website</label>
                    <input
                      id="start-website"
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website}
                      onChange={handleInputChange}
                    />
                  </div>

                  {status === 'error' && (
                    <p className="text-sm text-red-600" role="alert">
                      {errorMessage ?? 'Could not send your request. Try again or use Contact.'}
                    </p>
                  )}
                  {status === 'misconfigured' && (
                    <p className="text-sm text-red-600" role="alert">
                      This form is not configured yet. Please{' '}
                      <Link to="/contact" className="underline">
                        contact me
                      </Link>{' '}
                      directly.
                    </p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8"
                  >
                    {isSubmitting ? 'Sending…' : 'Send project request'}
                  </Button>
                  </fieldset>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

export default StartProjectForm
