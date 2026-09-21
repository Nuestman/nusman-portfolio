import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'

const HEARD_ABOUT_OPTIONS = [
  { value: 'referral', label: 'Referral' },
  { value: 'family_friends', label: 'Family / Friend' },
  { value: 'work_colleague', label: 'Work colleague' },
  { value: 'social_media', label: 'Social media' },
  { value: 'repeat', label: 'I have worked with you before' },
  { value: 'other', label: 'Other' },
] as const

const TIMELINE_OPTIONS = [
  'Not sure yet',
  '1 week',
  '2 weeks',
  '3 weeks',
  '4 weeks',
  '6 weeks',
  '8 weeks',
  'Flexible',
] as const

const TIMELINE_MANUAL_VALUE = '__manual__'

const BUDGET_OPTIONS = [
  'Not sure yet',
  'Under GH₵5,000',
  'GH₵5,000–10,000',
  'GH₵10,000–25,000',
  'GH₵25,000–50,000',
  'GH₵50,000+',
  'Open / discuss',
] as const

const NOT_SURE_YET = 'Not sure yet'

type Step = 'about' | 'challenge' | 'outcome' | 'timing' | 'inbox'

type FormData = {
  name: string
  email: string
  phone: string
  organisation: string
  source: string
  sourceOther: string
  problem: string
  wantBuilt: string
  whoFor: string
  successLooksLike: string
  timeline: string
  timelineManual: string
  budget: string
  website: string
}

const emptyForm: FormData = {
  name: '',
  email: '',
  phone: '',
  organisation: '',
  source: '',
  sourceOther: '',
  problem: '',
  wantBuilt: '',
  whoFor: '',
  successLooksLike: '',
  timeline: NOT_SURE_YET,
  timelineManual: '',
  budget: NOT_SURE_YET,
  website: '',
}

/** Numbered progress — inbox is a post-submit screen, not a step. */
const STEP_ORDER: Exclude<Step, 'inbox'>[] = [
  'about',
  'challenge',
  'outcome',
  'timing',
]

const STEP_LABELS = ['About you', 'Challenge', 'Outcome', 'Timing & budget']

function inboundBase(): string {
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

function sourceNeedsDetail(source: string): boolean {
  return source === 'other' || source === 'social_media'
}

const fieldClass =
  'w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors duration-200 placeholder:text-gray-500'

function StepIndicator({ current }: { current: number }) {
  const total = STEP_LABELS.length
  const label = STEP_LABELS[current] ?? ''
  const progress = ((current + 1) / total) * 100

  return (
    <div className="mb-8" aria-label={`Step ${current + 1} of ${total}: ${label}`}>
      <div className="flex items-end justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
            Step {current + 1} of {total}
          </p>
          <AnimatePresence mode="wait">
            <motion.p
              key={label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22 }}
              className="font-heading text-2xl text-dark-950 leading-none mt-1"
            >
              {label}
            </motion.p>
          </AnimatePresence>
        </div>
        <ol className="hidden sm:flex items-center gap-2 shrink-0 pb-1" aria-hidden>
          {STEP_LABELS.map((name, index) => {
            const done = index < current
            const isCurrent = index === current
            return (
              <li key={name} className="flex items-center gap-2">
                <span
                  className={`block h-3 w-3 rounded-full transition-colors ${
                    isCurrent
                      ? 'bg-gold-500 ring-[5px] ring-gold-100'
                      : done
                        ? 'bg-gold-500'
                        : 'bg-gray-200'
                  }`}
                />
                {index < total - 1 ? (
                  <span
                    className={`block h-0.5 w-4 ${
                      done ? 'bg-gold-400' : 'bg-gray-200'
                    }`}
                  />
                ) : null}
              </li>
            )
          })}
        </ol>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-600"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </div>
      <ol className="mt-3 flex sm:hidden justify-between gap-1" aria-hidden>
        {STEP_LABELS.map((name, index) => {
          const done = index < current
          const isCurrent = index === current
          return (
            <li
              key={name}
              className={`text-[10px] tracking-wide truncate ${
                isCurrent
                  ? 'text-dark-950 font-medium'
                  : done
                    ? 'text-gold-700'
                    : 'text-gray-400'
              }`}
            >
              {name}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

const panelMotion = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: { duration: 0.28 },
}

async function postJson(path: string, payload: Record<string, unknown>) {
  const response = await fetch(`${inboundBase()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = (await response.json().catch(() => null)) as
    | Record<string, unknown>
    | null
  return { response, data }
}

const verifyByToken = new Map<string, ReturnType<typeof postJson>>()

function verifyTokenOnce(token: string) {
  const existing = verifyByToken.get(token)
  if (existing) {
    return existing
  }
  const pending = postJson('/verify', { token })
  verifyByToken.set(token, pending)
  return pending
}

function networkErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : null
  const looksLikeNetwork =
    !message ||
    /failed to fetch|networkerror|load failed|network request failed/i.test(
      message,
    )
  return looksLikeNetwork
    ? 'Could not reach the server. Check your connection and try again, or use Contact.'
    : message || fallback
}

export function StartProjectForm() {
  const [step, setStep] = useState<Step>('about')
  const [form, setForm] = useState<FormData>(emptyForm)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugUrl, setDebugUrl] = useState<string | null>(null)

  const stepIndex = step === 'inbox' ? -1 : STEP_ORDER.indexOf(step)

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'source' && !sourceNeedsDetail(value)
        ? { sourceOther: '' }
        : {}),
      ...(name === 'timeline' && value !== TIMELINE_MANUAL_VALUE
        ? { timelineManual: '' }
        : {}),
    }))
  }

  const submitDraft = async () => {
    setPending(true)
    setError(null)
    setDebugUrl(null)
    const timeline =
      form.timeline === TIMELINE_MANUAL_VALUE
        ? form.timelineManual.trim() || NOT_SURE_YET
        : form.timeline.trim() || NOT_SURE_YET
    const budget = form.budget.trim() || NOT_SURE_YET
    try {
      const { response, data } = await postJson('/draft', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        organisation: form.organisation.trim() || undefined,
        source: form.source,
        sourceOther: sourceNeedsDetail(form.source)
          ? form.sourceOther.trim() || undefined
          : undefined,
        problem: form.problem.trim(),
        wantBuilt: form.wantBuilt.trim(),
        whoFor: form.whoFor.trim(),
        successLooksLike: form.successLooksLike.trim(),
        timeline,
        budget,
        website: form.website.trim() || undefined,
      })
      if (!response.ok || !data?.ok) {
        throw new Error(
          typeof data?.error === 'string'
            ? data.error
            : 'Could not send confirmation email.',
        )
      }
      if (typeof data.debugVerifyUrl === 'string') {
        setDebugUrl(data.debugVerifyUrl)
      }
      setStep('inbox')
    } catch (err) {
      setError(networkErrorMessage(err, 'Could not send confirmation email.'))
    } finally {
      setPending(false)
    }
  }

  const resend = async () => {
    setPending(true)
    setError(null)
    try {
      const { response, data } = await postJson('/resend', {
        email: form.email.trim(),
      })
      if (!response.ok || !data?.ok) {
        throw new Error(
          typeof data?.error === 'string' ? data.error : 'Could not resend.',
        )
      }
      if (typeof data.debugVerifyUrl === 'string') {
        setDebugUrl(data.debugVerifyUrl)
      }
    } catch (err) {
      setError(networkErrorMessage(err, 'Could not resend.'))
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="py-16 pb-24">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <p className="font-heading text-2xl text-gold-500 mb-2">nusman</p>
          <h1 className="section-heading mb-4 text-dark-950">
            Start a project with me
          </h1>
          <p className="text-lg text-gray-700">
            Walk through a short brief (less than 10 minutes), then confirm your email. <br /> For a quick hello, use{' '}
            <Link to="/contact" className="text-gold-600 font-semibold hover:underline">
              Contact
            </Link>
            .
          </p>
        </motion.div>

        <motion.div
          className="max-w-xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
        >
          <Card className="border-0 shadow-xl overflow-hidden">
            <CardContent className="p-6 md:p-8">
              {step !== 'inbox' ? <StepIndicator current={stepIndex} /> : null}

              <AnimatePresence mode="wait">
                {step === 'about' ? (
                  <motion.div key="about" {...panelMotion} className="space-y-5">
                    <p className="text-sm text-gray-600 -mt-1">
                      So I know who I&apos;m talking to.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label htmlFor="start-name" className="block text-sm font-medium text-dark-950 mb-2">
                          Your name
                        </label>
                        <input
                          id="start-name"
                          name="name"
                          value={form.name}
                          onChange={onChange}
                          required
                          minLength={2}
                          maxLength={120}
                          autoComplete="name"
                          placeholder="e.g. Ama Mensah"
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
                          value={form.email}
                          onChange={onChange}
                          required
                          autoComplete="email"
                          placeholder="e.g. ama@clinic.com"
                          className={fieldClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="start-phone" className="block text-sm font-medium text-dark-950 mb-2">
                          Phone
                        </label>
                        <input
                          id="start-phone"
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={onChange}
                          autoComplete="tel"
                          inputMode="tel"
                          placeholder="e.g. 024 123 4567"
                          className={fieldClass}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="start-organisation" className="block text-sm font-medium text-dark-950 mb-2">
                          Organisation / Business
                        </label>
                        <input
                          id="start-organisation"
                          name="organisation"
                          value={form.organisation}
                          onChange={onChange}
                          maxLength={160}
                          autoComplete="organization"
                          placeholder="e.g. Sunrise Clinic"
                          className={fieldClass}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="start-source" className="block text-sm font-medium text-dark-950 mb-2">
                          How did you hear about us?
                        </label>
                        <select
                          id="start-source"
                          name="source"
                          value={form.source}
                          onChange={onChange}
                          required
                          className={fieldClass}
                        >
                          <option value="">Choose one…</option>
                          {HEARD_ABOUT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {sourceNeedsDetail(form.source) ? (
                        <div className="sm:col-span-2">
                          <label htmlFor="start-source-other" className="block text-sm font-medium text-dark-950 mb-2">
                            {form.source === 'social_media'
                              ? 'Which platform?'
                              : 'Please specify'}
                          </label>
                          <input
                            id="start-source-other"
                            name="sourceOther"
                            value={form.sourceOther}
                            onChange={onChange}
                            required
                            maxLength={200}
                            className={fieldClass}
                            placeholder={
                              form.source === 'social_media'
                                ? 'e.g. Instagram, LinkedIn, X, Facebook'
                                : 'Where did you hear about this work?'
                            }
                          />
                        </div>
                      ) : null}
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button
                        type="button"
                        size="lg"
                        disabled={
                          form.name.trim().length < 2 ||
                          !form.email.includes('@') ||
                          !form.source ||
                          (sourceNeedsDetail(form.source) &&
                            !form.sourceOther.trim())
                        }
                        onClick={() => {
                          setError(null)
                          setStep('challenge')
                        }}
                      >
                        Continue
                      </Button>
                    </div>
                  </motion.div>
                ) : null}

                {step === 'challenge' ? (
                  <motion.div key="challenge" {...panelMotion} className="space-y-5">
                    <p className="text-sm text-gray-600 -mt-1">
                      Separate the pain from the ask.
                    </p>
                    <div>
                      <label htmlFor="start-problem" className="block text-sm font-medium text-dark-950 mb-2">
                        What&apos;s the problem?
                      </label>
                      <textarea
                        id="start-problem"
                        name="problem"
                        rows={3}
                        value={form.problem}
                        onChange={onChange}
                        required
                        minLength={10}
                        maxLength={2000}
                        placeholder="e.g. appointments get lost on WhatsApp, staff double-book, reports take hours"
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="start-want" className="block text-sm font-medium text-dark-950 mb-2">
                        What do you want built or fixed?
                      </label>
                      <textarea
                        id="start-want"
                        name="wantBuilt"
                        rows={3}
                        value={form.wantBuilt}
                        onChange={onChange}
                        required
                        minLength={10}
                        maxLength={2000}
                        placeholder="e.g. a simple booking app, a staff dashboard, an automated report"
                        className={fieldClass}
                      />
                    </div>
                    <div className="flex flex-wrap justify-between gap-3 pt-2">
                      <Button type="button" variant="secondary" onClick={() => setStep('about')}>
                        Back
                      </Button>
                      <Button
                        type="button"
                        size="lg"
                        disabled={
                          form.problem.trim().length < 10 ||
                          form.wantBuilt.trim().length < 10
                        }
                        onClick={() => setStep('outcome')}
                      >
                        Continue
                      </Button>
                    </div>
                  </motion.div>
                ) : null}

                {step === 'outcome' ? (
                  <motion.div key="outcome" {...panelMotion} className="space-y-5">
                    <p className="text-sm text-gray-600 -mt-1">
                      Who lives with this, and how you&apos;ll know it worked.
                    </p>
                    <div>
                      <label htmlFor="start-who" className="block text-sm font-medium text-dark-950 mb-2">
                        Who is it for (the users)?
                      </label>
                      <textarea
                        id="start-who"
                        name="whoFor"
                        rows={2}
                        value={form.whoFor}
                        onChange={onChange}
                        required
                        minLength={5}
                        maxLength={500}
                        placeholder="e.g. your clinic staff, patients, customers, your own team"
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="start-success" className="block text-sm font-medium text-dark-950 mb-2">
                        What does success look like?
                      </label>
                      <textarea
                        id="start-success"
                        name="successLooksLike"
                        rows={3}
                        value={form.successLooksLike}
                        onChange={onChange}
                        required
                        minLength={10}
                        maxLength={2000}
                        placeholder="How will you know the problem is solved or the project is done?"
                        className={fieldClass}
                      />
                    </div>
                    <div className="flex flex-wrap justify-between gap-3 pt-2">
                      <Button type="button" variant="secondary" onClick={() => setStep('challenge')}>
                        Back
                      </Button>
                      <Button
                        type="button"
                        size="lg"
                        disabled={
                          form.whoFor.trim().length < 5 ||
                          form.successLooksLike.trim().length < 10
                        }
                        onClick={() => setStep('timing')}
                      >
                        Continue
                      </Button>
                    </div>
                  </motion.div>
                ) : null}

                {step === 'timing' ? (
                  <motion.div key="timing" {...panelMotion} className="space-y-5">
                    <p className="text-sm text-gray-600 -mt-1">
                      Rough ranges are fine — we can refine later.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="start-timeline" className="block text-sm font-medium text-dark-950 mb-2">
                          Timeline
                        </label>
                        <select
                          id="start-timeline"
                          name="timeline"
                          value={form.timeline}
                          onChange={onChange}
                          className={fieldClass}
                        >
                          {TIMELINE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                          <option value={TIMELINE_MANUAL_VALUE}>Enter manually</option>
                        </select>
                        {form.timeline === TIMELINE_MANUAL_VALUE ? (
                          <input
                            name="timelineManual"
                            value={form.timelineManual}
                            onChange={onChange}
                            required
                            maxLength={200}
                            className={`${fieldClass} mt-2`}
                            placeholder="e.g. before Easter, mid-July"
                          />
                        ) : null}
                      </div>
                      <div>
                        <label htmlFor="start-budget" className="block text-sm font-medium text-dark-950 mb-2">
                          Budget range
                        </label>
                        <select
                          id="start-budget"
                          name="budget"
                          value={form.budget}
                          onChange={onChange}
                          className={fieldClass}
                        >
                          {BUDGET_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
                      <input
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={form.website}
                        onChange={onChange}
                      />
                    </div>
                    {error ? (
                      <p className="text-sm text-red-600" role="alert">
                        {error}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap justify-between gap-3 pt-2">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={pending}
                        onClick={() => setStep('outcome')}
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        size="lg"
                        disabled={
                          pending ||
                          (form.timeline === TIMELINE_MANUAL_VALUE &&
                            !form.timelineManual.trim())
                        }
                        onClick={() => void submitDraft()}
                      >
                        {pending ? 'Sending…' : 'Send request'}
                      </Button>
                    </div>
                  </motion.div>
                ) : null}

                {step === 'inbox' ? (
                  <motion.div key="inbox" {...panelMotion} className="space-y-5 text-center py-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-500/15 text-gold-600">
                      <span className="font-heading text-2xl" aria-hidden>
                        @
                      </span>
                    </div>
                    <h2 className="font-heading text-3xl text-dark-950">
                      Confirm your email
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      Your request is on my Desk. We sent a link to{' '}
                      <span className="font-medium text-dark-950">{form.email}</span>.
                      Open it to confirm your email — the project stays inactive until then.
                    </p>
                    {debugUrl ? (
                      <p className="text-left text-xs text-gray-500 break-all rounded-lg bg-gray-50 p-3">
                        Dev link:{' '}
                        <a href={debugUrl} className="text-gold-600 underline">
                          {debugUrl}
                        </a>
                      </p>
                    ) : null}
                    {error ? (
                      <p className="text-sm text-red-600" role="alert">
                        {error}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={pending}
                        onClick={() => void resend()}
                      >
                        {pending ? 'Sending…' : 'Resend email'}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={pending}
                        onClick={() => setStep('timing')}
                      >
                        Edit answers
                      </Button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

/** Confirm link landing — activates the Desk project already created on submit. */
export function StartContinueForm() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''

  const [phase, setPhase] = useState<'loading' | 'done' | 'error'>('loading')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [alreadyDone, setAlreadyDone] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function verify() {
      if (!token) {
        setPhase('error')
        setError(
          'This link is missing a token. Request a new email from Start a project.',
        )
        return
      }
      try {
        const { response, data } = await verifyTokenOnce(token)
        if (!response.ok || !data?.ok) {
          throw new Error(
            typeof data?.error === 'string'
              ? data.error
              : 'Could not confirm this link.',
          )
        }
        if (cancelled) return
        setName(typeof data.name === 'string' ? data.name.split(' ')[0] ?? '' : '')
        setAlreadyDone(data.alreadyDone === true)
        setPhase('done')
      } catch (err) {
        if (cancelled) return
        setPhase('error')
        setError(networkErrorMessage(err, 'Could not confirm this link.'))
      }
    }
    void verify()
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <section className="py-16 pb-24">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <p className="font-heading text-2xl text-gold-500 mb-2">nusman</p>
          <h1 className="section-heading mb-4 text-dark-950">
            {phase === 'loading'
              ? 'Confirming…'
              : phase === 'error'
                ? 'Link issue'
                : name
                  ? `Thanks, ${name}`
                  : 'Request sent'}
          </h1>
        </motion.div>

        <div className="max-w-xl mx-auto">
          <Card className="border-0 shadow-xl overflow-hidden">
            <CardContent className="p-6 md:p-8">
              {phase === 'loading' ? (
                <p className="text-center text-gray-600 py-10">
                  Confirming your email…
                </p>
              ) : null}

              {phase === 'error' ? (
                <div className="space-y-4 text-center py-6">
                  <p className="text-red-600" role="alert">
                    {error}
                  </p>
                  <Button asChild>
                    <Link to="/start">Start again</Link>
                  </Button>
                </div>
              ) : null}

              {phase === 'done' ? (
                <motion.div
                  {...panelMotion}
                  className="space-y-4 text-center py-6"
                >
                  <h2 className="font-heading text-3xl text-dark-950">
                    {alreadyDone ? 'Already confirmed' : 'You are all set'}
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {alreadyDone
                      ? 'This request was already confirmed. Check your inbox for the receipt, or email me if anything changed.'
                      : 'Your email is confirmed and the project is active on my Desk. I\'ll review it and reach out soon, usually within a business day.'}
                  </p>
                  <Button asChild>
                    <Link to="/">Back home</Link>
                  </Button>
                </motion.div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default StartProjectForm
