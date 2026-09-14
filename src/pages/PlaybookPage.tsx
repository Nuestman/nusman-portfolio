import React, { useEffect, useState } from 'react'
import { CheckCircle2, Circle, CircleDot, Copy } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import {
  PLAYBOOK_PATH,
  cyclePlaybookTodoStatus,
  isPlaybookGateId,
  playbookAfterCallMessage,
  playbookAgenda,
  playbookAgreement,
  playbookFirstReply,
  playbookGates,
  playbookHabits,
  playbookIntakeMessage,
  playbookOptions,
  playbookQuestions,
  playbookThisWeek,
  type PlaybookGateId,
  type PlaybookTodo,
} from '../data/playbook'
import { usePageMeta } from '../hooks/usePageMeta'
import { cn } from '../lib/utils'

const NOTES_KEY = 'nu-playbook-notes'
const TODOS_KEY = 'nu-playbook-todos'
const GATE_KEY = 'nu-playbook-gate'

const jumpLinks = [
  { href: '#this-week', label: 'This week' },
  { href: '#notes', label: 'Notes' },
  { href: '#reply', label: 'Reply' },
  { href: '#people', label: 'People' },
  { href: '#gates', label: 'Gates' },
  { href: '#intake', label: 'Intake' },
  { href: '#call', label: 'Call' },
  { href: '#propose', label: 'Propose' },
  { href: '#agree', label: 'Agree' },
  { href: '#habits', label: 'Habits' },
]

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeStored(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Private browsing or quota — keep the in-memory value.
  }
}

function CopyTextButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
      <Copy className="w-4 h-4 mr-2" aria-hidden="true" />
      {copied ? 'Copied' : label}
    </Button>
  )
}

function restoreTodos(): PlaybookTodo[] {
  const stored = readStored<PlaybookTodo[]>(TODOS_KEY, playbookThisWeek)
  const byId = new Map(stored.map((item) => [item.id, item]))
  return playbookThisWeek.map((item) => {
    const previous = byId.get(item.id)
    return previous ? { ...item, status: previous.status } : item
  })
}

const PlaybookPage: React.FC = () => {
  const [todos, setTodos] = useState<PlaybookTodo[]>(playbookThisWeek)
  const [activeGate, setActiveGate] = useState<PlaybookGateId>('qualify')
  const [notes, setNotes] = useState('')
  const [ready, setReady] = useState(false)

  usePageMeta({
    title: 'Private playbook',
    description: 'Internal working notes. This page is not linked from the public site.',
    path: PLAYBOOK_PATH,
    robots: 'noindex, nofollow',
  })

  useEffect(() => {
    setTodos(restoreTodos())
    const storedGate = readStored<string>(GATE_KEY, 'qualify')
    setActiveGate(isPlaybookGateId(storedGate) ? storedGate : 'qualify')
    setNotes(readStored<string>(NOTES_KEY, ''))
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    writeStored(TODOS_KEY, todos)
  }, [todos, ready])

  useEffect(() => {
    if (!ready) return
    writeStored(GATE_KEY, activeGate)
  }, [activeGate, ready])

  useEffect(() => {
    if (!ready) return
    writeStored(NOTES_KEY, notes)
  }, [notes, ready])

  const doneCount = todos.filter((item) => item.status === 'completed').length
  const gateIndex = playbookGates.findIndex((gate) => gate.id === activeGate)
  const active = playbookGates[gateIndex] ?? playbookGates[0]

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="sticky top-20 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <nav
          aria-label="Playbook sections"
          className="container mx-auto px-4 py-3 overflow-x-auto"
        >
          <ul className="flex gap-2 min-w-max">
            {jumpLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-dark-950 hover:border-gold-500 hover:text-gold-600"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-4xl space-y-12">
        <header className="space-y-4">
          <p className="inline-flex rounded-full bg-amber-100 text-amber-900 px-3 py-1 text-sm font-medium">
            Private draft — not in the menu
          </p>
          <h1 className="section-heading text-dark-950">Client discovery playbook</h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            Use this for the colleague-and-dad project first, then reuse it for every future client.
            Public promise: Discover & Plan → Build & Test → Launch & Support. Internally,
            Discover & Plan has four gates so you never start building from a corridor conversation.
            Checklist, current gate, and notes save on this device.
          </p>
        </header>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-gray-500">This week</p>
              <p className="font-heading text-2xl text-dark-950 mt-1">Qualify + intake</p>
              <p className="text-sm text-gray-600 mt-1">No code yet.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-gray-500">This-week actions</p>
              <p className="font-heading text-2xl text-dark-950 mt-1">
                {doneCount}/{todos.length} done
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-gray-500">Current gate</p>
              <p className="font-heading text-2xl text-dark-950 mt-1">{active.label}</p>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <h2 className="font-heading text-2xl text-dark-950 mb-2">Treat the colleague as a real client</h2>
          <p className="text-gray-800 leading-relaxed">
            Workplace rapport is the risk, not the advantage. Favours skip discovery, skip deposit,
            and expand forever. Keep it off AGAHF time, devices, and data unless this is official
            work. If dad is the user, a briefing from her alone is not discovery.
          </p>
        </div>

        <section id="this-week" className="scroll-mt-36 space-y-4">
          <h2 className="section-heading text-dark-950">Do this week</h2>
          <p className="text-gray-600">Tap a row to cycle pending → in progress → done.</p>
          <ul className="space-y-2">
            {todos.map((item) => {
              const Icon =
                item.status === 'completed'
                  ? CheckCircle2
                  : item.status === 'in_progress'
                    ? CircleDot
                    : Circle
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setTodos((current) =>
                        current.map((todo) =>
                          todo.id === item.id
                            ? { ...todo, status: cyclePlaybookTodoStatus(todo.status) }
                            : todo,
                        ),
                      )
                    }}
                    className={cn(
                      'w-full flex items-start gap-3 rounded-xl border bg-white px-4 py-3 text-left',
                      item.status === 'completed'
                        ? 'border-green-200 text-gray-500'
                        : item.status === 'in_progress'
                          ? 'border-gold-400'
                          : 'border-gray-200',
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5 mt-0.5 shrink-0',
                        item.status === 'completed'
                          ? 'text-green-600'
                          : item.status === 'in_progress'
                            ? 'text-gold-500'
                            : 'text-gray-400',
                      )}
                      aria-hidden="true"
                    />
                    <span className={item.status === 'completed' ? 'line-through' : undefined}>
                      {item.content}
                    </span>
                    <span className="sr-only">Status: {item.status.replace('_', ' ')}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <section id="notes" className="scroll-mt-36 space-y-4">
          <h2 className="section-heading text-dark-950">Working notes</h2>
          <p className="text-gray-600">
            Jot what she says, what to change in this playbook, and questions for later. Saved on
            this phone or browser only — not on the server.
          </p>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={8}
            placeholder="What I heard, what to revise, next action…"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
          />
        </section>

        <section id="reply" className="scroll-mt-36 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="section-heading text-dark-950">Send this first</h2>
            <CopyTextButton text={playbookFirstReply} label="Copy reply" />
          </div>
          <p className="text-gray-700">
            Do not ask “what should I build?” Do not offer a free prototype. Frame the relationship:
            you run a process, she is hiring it, dad may need to be in the room.
          </p>
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp / email reply</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                {playbookFirstReply}
              </pre>
            </CardContent>
          </Card>
        </section>

        <section id="people" className="scroll-mt-36 space-y-4">
          <h2 className="section-heading text-dark-950">Two people, two jobs</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <p className="text-sm text-gold-600 font-medium">Buyer / liaison</p>
                <CardTitle>Colleague</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700">
                <p>Pays, chases, and translates. Often over-specifies because she is not the daily user.</p>
                <p className="text-gray-600">
                  Ask her for budget, deadline, and what “done” means for the family. Do not let her
                  design dad’s workflow from memory.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <p className="text-sm text-gold-600 font-medium">User</p>
                <CardTitle>Dad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700">
                <p>If he will tap the screens, he must be in discovery — even 20 minutes on a video call.</p>
                <p className="text-gray-600">
                  Watch him do today’s method. Note literacy, language, phone model, and what he
                  already trusts (WhatsApp, paper, a notebook). Build for that, not for a laptop.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="gates" className="scroll-mt-36 space-y-4">
          <h2 className="section-heading text-dark-950">The seven gates</h2>
          <p className="text-gray-600">
            Tap a phase to mark where this engagement is. You do not enter Build until Agree is done.
          </p>
          <div className="flex h-3 rounded-full overflow-hidden bg-gray-200" aria-hidden="true">
            <div className="w-2/3 bg-blue-700" title="Discover & Plan" />
            <div className="w-1/6 bg-gold-500" title="Build & Test" />
            <div className="w-1/6 bg-green-600" title="Launch & Support" />
          </div>
          <p className="text-sm text-gray-500">4 plan · 1 build · 1 launch</p>
          <div className="flex flex-wrap gap-2">
            {playbookGates.map((gate) => (
              <Button
                key={gate.id}
                type="button"
                size="sm"
                variant={gate.id === activeGate ? 'default' : 'outline'}
                onClick={() => setActiveGate(gate.id)}
              >
                {gate.label}
              </Button>
            ))}
          </div>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Gate</th>
                  <th className="px-4 py-3 font-medium">Maps to site</th>
                  <th className="px-4 py-3 font-medium">Exit rule</th>
                </tr>
              </thead>
              <tbody>
                {playbookGates.map((gate, index) => (
                  <tr
                    key={gate.id}
                    className={cn(
                      'border-t border-gray-100',
                      gate.id === activeGate && 'bg-gold-50',
                      index < gateIndex && 'text-gray-500',
                    )}
                  >
                    <td className="px-4 py-3 font-medium text-dark-950">{gate.label}</td>
                    <td className="px-4 py-3">{gate.publicStep}</td>
                    <td className="px-4 py-3">{gate.exitWhen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Card>
            <CardHeader>
              <p className="text-sm text-gold-600 font-medium">{active.publicStep}</p>
              <CardTitle>{active.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-dark-950 mb-1">You</h3>
                <p className="text-gray-700">{active.youDo}</p>
              </div>
              <div>
                <h3 className="font-semibold text-dark-950 mb-1">They</h3>
                <p className="text-gray-700">{active.theyDo}</p>
              </div>
              <div>
                <h3 className="font-semibold text-dark-950 mb-1">Leave this gate when</h3>
                <p className="text-gray-900 font-medium">{active.exitWhen}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="intake" className="scroll-mt-36 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="section-heading text-dark-950">Intake — eight questions</h2>
            <CopyTextButton text={playbookIntakeMessage} label="Copy questions" />
          </div>
          <p className="text-gray-700">
            Send after the 15-min qualify. Written answers beat a chat dump. If she cannot answer
            “who uses it” and “what success looks like,” you do not have a project yet.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Theme</th>
                  <th className="px-4 py-3 font-medium">Ask</th>
                  <th className="px-4 py-3 font-medium">Why</th>
                </tr>
              </thead>
              <tbody>
                {playbookQuestions.map((item) => (
                  <tr key={item.theme} className="border-t border-gray-100 align-top">
                    <td className="px-4 py-3 font-medium text-dark-950">{item.theme}</td>
                    <td className="px-4 py-3">{item.ask}</td>
                    <td className="px-4 py-3 text-gray-600">{item.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="call" className="scroll-mt-36 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="section-heading text-dark-950">Discovery call — 45 minutes</h2>
            <CopyTextButton text={playbookAfterCallMessage} label="Copy follow-up" />
          </div>
          <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-4">
            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium w-16">Mins</th>
                    <th className="px-4 py-3 font-medium">Block</th>
                  </tr>
                </thead>
                <tbody>
                  {playbookAgenda.map((item) => (
                    <tr key={item.block} className="border-t border-gray-100 align-top">
                      <td className="px-4 py-3 font-medium">{item.mins}</td>
                      <td className="px-4 py-3">{item.block}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <h3 className="font-heading text-2xl text-dark-950 mb-2">After the call</h3>
              <p className="text-gray-800 leading-relaxed">
                Same day, send: (1) the problem sentence, (2) what is in / out, (3) when the options
                note will arrive. That message is the start of the project file.
              </p>
            </div>
          </div>
        </section>

        <section id="propose" className="scroll-mt-36 space-y-4">
          <h2 className="section-heading text-dark-950">Propose three shapes, not one quote</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {playbookOptions.map((option) => (
              <Card key={option.title}>
                <CardHeader>
                  {option.badge ? (
                    <p className="text-sm text-gold-600 font-medium">{option.badge}</p>
                  ) : null}
                  <CardTitle>{option.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{option.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-gray-600">
            Every option needs: what is included, what is not, timeline, price, deposit, and who
            provides content/data. If you cannot name a non-goal, the scope is not ready.
          </p>
        </section>

        <section id="agree" className="scroll-mt-36 space-y-4">
          <h2 className="section-heading text-dark-950">Agree — one page, then deposit</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Clause</th>
                    <th className="px-4 py-3 font-medium">Keep it plain</th>
                  </tr>
                </thead>
                <tbody>
                  {playbookAgreement.map((item) => (
                    <tr key={item.clause} className="border-t border-gray-100 align-top">
                      <td className="px-4 py-3 font-medium text-dark-950">{item.clause}</td>
                      <td className="px-4 py-3">{item.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <h3 className="font-heading text-2xl text-dark-950 mb-2">Do not start the build unpaid</h3>
              <p className="text-gray-800 leading-relaxed">
                A colleague who “trusts you” is the easiest person to undercharge. Deposit is
                respect, not distrust. If she cannot pay a deposit, it is not a project — it is a maybe.
              </p>
            </div>
          </div>
        </section>

        <section id="habits" className="scroll-mt-36 space-y-4">
          <h2 className="section-heading text-dark-950">Fine-tune the business, not just this job</h2>
          <p className="text-gray-700">
            The homepage and FAQ now both use the three public steps. Extra gates stay on this
            private page. After this client, reuse the same message, eight questions, agenda, and one-pager.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Habit</th>
                  <th className="px-4 py-3 font-medium">Do this every client</th>
                  <th className="px-4 py-3 font-medium">Stop doing</th>
                </tr>
              </thead>
              <tbody>
                {playbookHabits.map((item) => (
                  <tr key={item.habit} className="border-t border-gray-100 align-top">
                    <td className="px-4 py-3 font-medium text-dark-950">{item.habit}</td>
                    <td className="px-4 py-3">{item.doThis}</td>
                    <td className="px-4 py-3 text-gray-600">{item.stopDoing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="font-heading text-2xl text-dark-950 mb-2">If this is actually AGAHF / clinical work</h2>
          <p className="text-gray-800 leading-relaxed">
            Patient data, incident reports, first-aid posts, or anything that should live on
            foundation systems is not a side project. That needs official approval, hosting, and
            access control — the same bar you already know from Mineaid HMS. Do not mix
            family-and-favour energy with clinical records.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="section-heading text-dark-950">What good looks like</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5">
                <p className="font-heading text-2xl text-dark-950">1 sentence</p>
                <p className="text-sm text-gray-600 mt-2">Shared problem statement both of you can repeat</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="font-heading text-2xl text-dark-950">3 options</p>
                <p className="text-sm text-gray-600 mt-2">Written before any repository is created</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="font-heading text-2xl text-dark-950">Dad present</p>
                <p className="text-sm text-gray-600 mt-2">At least once before you design screens</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}

export default PlaybookPage
