# Desk 2.0 — surfaces & process plan

Living plan for the **next major cut** of Desk + Portal. Goal: a clean guided process — CRM, playbook, live job, and client portal each do one job. Update this file when a decision changes.

Supersedes the “kitchen sink project page” behaviour of Desk **1.3.0**. Prior snapshots: [archive/desk-1.1.md](./archive/desk-1.1.md). Live status: [desk-status.md](./desk-status.md) (**2.4.0**). Detail still useful in [desk.md](./desk.md) and [portal.md](./portal.md); **this file wins** where they conflict.

Schema changes are allowed — no production clients on the system yet.

---

## One-line model

**Clients = who · Playbook = how · Project = what for this job · Portal = what they may see and say (including schedule).**

---

## Why this cut exists

Desk 1.x put too much on `/projects/[id]`: every gate form, coaching copy, packages, agreement, portal toggles, and timeline in one scroll. That mixed:

- **Process guide** (playbook / secret sauce) with  
- **Live job records** (what actually happened on this engagement)

The playbook was supposed to *guide* work. Forms on the project were supposed to *capture* work. Portal was supposed to let the client *follow and participate*. This plan locks that split and adds a **scheduler** on Portal (and Desk) for meetings, demos, and similar.

---

## Locked decisions

| Topic | Decision |
|---|---|
| CRM | **`/clients` + `/clients/[id]`** (and person edit). Who pays, people, contact, portal invite. Not playbook. Not gate encyclopedias. |
| Playbook | **`/playbook` only** — how Usman works: stages, checklists, copy templates, option *coaching*. No live job answers stored here. |
| Desk project | **`/projects/[id]`** — facts for **this** job: identity, **current gate** work, timeline. Past gates collapsed or linked, not all open at once. |
| Portal project | Thin client home: progress, package, updates, intake (when open), messages, **schedule**. |
| Data entry | New facts enter via **forms** on Desk (and allowed Portal forms). Saving updates records and, where useful, timeline notes. |
| Coaching vs client copy | Playbook / option starters = operator only. Client-facing summary and Portal copy stay separate (already started in 1.3). |
| Hosts | Unchanged: `desk.nusman.dev` + `portal.nusman.dev`, same `admin/` app, host routing. |
| Database | Neon **nusmandotdev** only. Migrations OK while pre-production. |
| Scheduler | First-class **project events** (meetings, demos, calls, etc.), visible and confirmable on Portal; creatable/manageable on Desk. |

---

## Non-goals (this cut)

- Rebuilding the public marketing site  
- Client passwords / TOTP on Portal  
- Importing product databases (Mineaid, etc.)  
- Dumping playbook prose onto the project or portal page  
- A separate Vercel app for Portal  
- Calendar sync (Google/Outlook) in v1 of scheduler — local schedule + confirm is enough first  
- Multi-timezone wizard polish beyond storing UTC + a display zone if needed  

---

## Surface map

### 1. CRM — Clients

| Route | Purpose |
|---|---|
| `/clients` | Hiring parties list |
| `/clients/[id]` | **View-first** org + notes, people (with Portal status), projects. Add/edit behind Edit/Add — not always-open forms |
| `/clients/[id]/people/[personId]/edit` | Contact + portal enable + magic link |

CRM answers: *Who is this? Who do I talk to? Can they use Portal?*  

**In CRM:** identity, people, portal invite, list of this client’s projects.  
**Not in CRM:** playbook, gate forms, schedule (those stay on Project / Schedule).
### 2. Playbook — how I work

| Route | Purpose |
|---|---|
| `/playbook` | Stages, checklists, WhatsApp/copy templates, option coaching cards |

Playbook answers: *What do I do at this stage? What do I send?*  
Optional UX: “Open current project” / deep-link to that gate on a job — **data still lands on the project**.

### 3. Desk project — this job

| Route | Purpose |
|---|---|
| `/projects` | Hiring jobs list |
| `/projects/[id]` | **Restructured** job home (below) |
| `/projects/new` | Open a job |
| Gate/record edit subroutes | As today where needed |
| `/messages`, `/messages/[projectId]` | Operator inbox for portal threads |
| `/schedule` | Operator hub for all project appointments (still scoped to a job) |

**`/projects/[id]` layout (locked):**

1. **Header** — title, link to client, status, current gate + move control  
2. **Current-gate panel** — only the records/forms for `current_gate` (Qualify / Intake / Discover / Propose / Agree / Build / Launch as relevant). Edit/Add reveals forms; view shows saved values  
3. **Timeline** — `project_notes` (+ automatic short notes on gate move, package choose, event confirm, etc.)  
4. **Schedule** — upcoming/past events for this project (Desk can create/edit; see schema)  
5. **Portal strip** — intake open toggle; link to conversation; event counts if useful  
6. **Danger zone** — delete  

Past gates: collapsed accordion or “Earlier stages” — readable, not a second full playbook.

Copy templates: short “Copy from playbook” on the **current** gate only, or stay exclusively on `/playbook`. Do **not** paste full playbook sections into the project scroll.

### 4. Portal — client participation

| Route | Purpose |
|---|---|
| `/` | Landing |
| `/login`, `/auth/magic` | Magic link |
| `/profile` | Read-only person |
| `/projects` | Their hiring projects |
| `/projects/[id]` | Progress, package, updates |
| `/projects/[id]/intake` | Intake when open |
| `/projects/[id]/messages` | Thread (Desk also has `/messages`) |
| `/schedule` | Appointments across their projects |
| `/projects/[id]/schedule` | Same, scoped to one job |

Portal answers: *Where is my project? What’s in scope? What changed? Can I write Usman? When do we meet?*

---

## Scheduler

### Purpose

Schedule and confirm **meetings, demos, calls**, and similar against a **project** (not free-floating CRM appointments in v1).

### Behaviours

| Actor | Can |
|---|---|
| Operator (Desk) | Create, edit, cancel, mark completed; propose times; confirm client proposals |
| Client (Portal) | See events for their projects; **confirm** or **decline** operator proposals; optionally **request** a meeting (status `requested`) |
| System | Timeline note on create / confirm / cancel |

### Event kinds (v1)

`call` | `meeting` | `demo` | `other`  
(Extend later if needed.)

### Event statuses (v1)

| Status | Meaning |
|---|---|
| `requested` | Client asked; operator not yet set a firm time |
| `proposed` | Operator (or either party) offered a time; awaiting confirm |
| `confirmed` | Both sides agreed (or operator confirmed after client accept) |
| `cancelled` | Called off |
| `completed` | Happened |

Exact confirm rules (one-click client confirm vs dual confirm) can stay simple in v1: **client confirm flips `proposed` → `confirmed`**; operator can force confirm/cancel.

### Schema (new migration, e.g. `0009_project_events`)

**`project_events`**

| Column | Notes |
|---|---|
| `id` | uuid PK |
| `project_id` | FK → projects, cascade |
| `kind` | enum above |
| `title` | short label (e.g. “Discovery call”) |
| `status` | enum above |
| `starts_at` | timestamptz (nullable while `requested`) |
| `ends_at` | timestamptz nullable |
| `location` | text — Zoom/WhatsApp/place |
| `notes` | text — agenda / prep (operator may mark some notes internal later; v1 all visible to portal people on that client or split `client_notes` / `internal_notes`) |
| `created_by_kind` | `operator` \| `client` |
| `person_id` | nullable FK — client person if they requested/confirmed |
| `confirmed_at` | timestamptz nullable |
| `cancelled_at` | timestamptz nullable |
| `created_at` / `updated_at` | timestamps |

Index: `(project_id, starts_at)`.

**Relation to existing `project_demos`:** keep demos as **delivery evidence** (what we showed / notes after). Scheduler events of kind `demo` are **appointments**. Completing a demo event may later prompt “add demo record” — not required in v1; avoid dual-writing until it hurts.

### UI

- **Desk `/schedule`** — wide hub: Cards / Calendar toggle (`react-big-calendar`); all project events; propose time / cancel / open project  
- **Desk project → Schedule** — create/edit for that job  
- **Portal `/schedule`** — same wide layout + Cards / Calendar; confirm/decline/cancel; request  
- **Portal project → Schedule** — same actions scoped to one job  
- Optional later: Today page widget “next 7 days of events”

### Non-goals for scheduler v1

- Google Calendar / ICS feed  
- Multi-project resource booking  
- SMS reminders (email via Resend optional stretch)

---

## Process flow (happy path)

1. Lead or client lands in **CRM** (manual or `/start` → inbound).  
2. Open a **project**; gate starts at Qualify.  
3. Operator uses **Playbook** for what to do/send; fills **current-gate forms** on the project.  
4. Timeline accumulates decisions.  
5. Invite person to **Portal**; client sees progress, answers intake, messages, confirms demos/calls.  
6. Gate moves when leave-blocks are satisfied (unchanged rules unless this plan revises them later).  

---

## Delivery phases

1. **Docs** — this plan locked; pointers from desk.md / portal.md / archive README — **done**  
2. **Desk project reshape** — current-gate panel + collapsed past + timeline + thin portal strip — **done**  
3. **Playbook hygiene** — coaching on `/playbook`; GateSwitcher chips only (no You/They/Exit card on project) — **done**  
4. **Migration `0009_project_events`** — schema + queries + audit/timeline on lifecycle — **done**  
5. **Desk schedule UI** on project — list, add, edit, confirm/cancel/complete — **done**  
6. **Portal schedule UI** — list, confirm/decline, request; hubs + Cards/Calendar — **done**  
7. **Polish** — timeline notes on event lifecycle; Today **Next 7 days** teaser — **done**  
8. **Status / changelog / version bump** — Desk **2.0.0** — **done**

---

## Acceptance

- Opening a hiring job no longer feels like reading the whole playbook.  
- Operator can run Qualify → … → Launch using playbook as guide and project forms as the record.  
- Client on Portal can follow progress, message, and **confirm a proposed demo/meeting**.  
- CRM stays on Clients; playbook stays on Playbook.  

---

## Immediate next step

Desk **2.0.0** cut is shipped. Current product version is **2.4.0** ([desk-status.md](./desk-status.md), [changelog.md](./changelog.md)). Further work is ordinary product iteration (routing cleanup, calendar sync, Today refinements, etc.), not this cut.
