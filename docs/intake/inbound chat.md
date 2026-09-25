Here’s the map. They mean different things in different layers, which is why they feel vague.

---

## Inbound

Used in **three separate senses**:

### 1. Client source enum (`clients.source = "inbound"`)
- **Meaning:** “How this client arrived” — originally “came via the website,” as opposed to referral / repeat / other.
- **Where:** DB enum, Desk client form dropdown (label now **Inbound / website**), docs.
- **Tension:** After the “heard about us” work, `/start` no longer forces `source: "inbound"`. It stores referral / family_friends / work_colleague / repeat / other. So **`inbound` is now mostly a Desk-manual leftover**, not what new `/start` leads write.

### 2. Technical channel: the `/start` → Desk pipeline
- **Meaning:** Public form posts into Desk; creates client, person, project, qualify, note, email, notification.
- **Where:**  
  - Route `/api/inbound-lead`  
  - `inbound-rate-limit.ts`, `inbound-email.ts`  
  - Project title suffix `— inbound` when org is set  
  - Copy like “Inbound lead”, `actorEmail: inbound@nusman.dev`, audit `inbound.lead`  
  - Notification kind `"inbound"` (inbox label: **Inbound**)  
  - Env `VITE_DESK_INBOUND_URL`, `INBOUND_ALLOWED_ORIGINS`
- **This is the confusing one for operators:** “Inbound” = eng jargon for “website start form,” not a human source.

### 3. Casual prose
- Qualify hint: “oral or inbound”  
- Docs: “inbound leads”, “inbound receipt”  
- Same idea as (2): website-started job vs you typed it yourself.

**Bottom line for inbound:** one word covers (a) a CRM source value and (b) the whole public start-form pipe. Those should probably not share a name.

---

## Intake

Also **several senses**, mostly process/legacy:

### 1. Legacy process gate (`project_gate = "intake"`)
- **Old strip:** qualify → **intake** → discover → …  
- **Now:** remap (`0011`) folded intake into **discover**; active strip is Qualify → Discover → Plan → Build → Launch.  
- `"intake"` still exists in the DB enum for old rows.

### 2. The questions table (`project_intake_answers`)
- **Meaning:** The eight discovery questions (Problem, Success, etc.).  
- **Still live** under that table name and Desk/Portal forms (`IntakeForm`, `PortalIntakeForm`, `saveIntakeAction`).  
- UI language has already drifted toward **Discovery / questions**; code/DB still say intake.

### 3. Portal flag + URL (`portal_intake_open`, `/projects/[id]/intake`)
- **Meaning:** Desk toggle “Clients can fill discovery answers”; Portal page at `/intake`.  
- Desk control copy already says **discovery**; path/column still say **intake**.

### 4. Playbook / docs
- Playbook section “Intake — eight questions”  
- Older desk.md still describes intake as a gate  
- Export CSV `intake.csv`

**Bottom line for intake:** product language is already “discovery / questions”; **intake** is leftover from the old gate name and table/URL.

---

## Why they clash

| Term | Sounds like | Actually means (often) |
|---|---|---|
| Inbound | “Something coming in” / vague lead type | Website `/start` pipeline **or** old CRM source |
| Intake | Medical/admin form | Eight discovery Qs **or** old gate **or** Portal form access |

They also sit next to each other mentally (“inbound intake”) even though one is **lead channel** and the other is **project questionnaire**.

---

## Sensible rename directions (for later)

**Inbound (channel)**  
- UI: “Website / Start a project”, “Public request”, “nusman.dev lead”  
- Keep `inbound` only in API paths if you want, or rename route to `/api/start-lead` later  
- CRM source: drop or rename `inbound` → something like `website` only for Desk-tagged rows; let “heard about us” stay the real source  

**Intake (questions)**  
- UI/URL: already moving to Discovery — finish that (`/questions` or keep `/intake` as alias)  
- DB: keep `project_intake_answers` until a migration is worth it; rename labels/forms first  

When you want to pick alternatives, we can do a rename plan that separates **display copy** (cheap) from **enum/API/URL** (migration).