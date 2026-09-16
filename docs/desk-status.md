# Desk status

Checked 16 Sep 2026 against the code in `admin/`. Product version: **2.0.0** (`admin/package.json`). Product rules: [desk-2.0.md](./desk-2.0.md) (wins) and [desk.md](./desk.md). Portal: [portal.md](./portal.md). Archive: [archive/desk-1.1.md](./archive/desk-1.1.md). Visual: [style-guide.md](./style-guide.md). Deploy: [deploy.md](./deploy.md). Update this file when something ships or an open item is closed.

Desk **2.0.0** / Portal **1.0** are usable. Public site **4.1.0** posts `/start` leads into Desk.

---

## Live

Hiring jobs with gate records, table-row edit/remove, playbook on Desk, multi-format export, own products as records, an audit trail with before/after, operator profiles, sessions for device revoke, **Portal** (magic link), **Messages** inbox, **Schedule** hubs (Cards/Calendar), and **inbound leads** from the public `/start` form.

### Routes

| Route | Status |
|---|---|
| `/login` | Live. Env bootstrap only until owner hash exists; optional TOTP after password |
| `/` | Today — active projects + **Next 7 days** schedule teaser |
| `/log`, `/log/[id]/edit` | Live. UI says **Journal**; URL stays `/log` |
| `/audit`, `/audit/[id]` | Live. Row click opens detail |
| `/clients` … `/clients/[id]/people/[personId]/edit` | Live. Person edit includes portal enable + magic link |
| `/schedule` | Live. Hub: Cards / Calendar; create/edit still on project |
| `/projects` … gate records, notes, options, changes, demos | Live. **Desk 2.0:** current gate first; earlier stages collapsed; timeline; **Schedule** (`project_events`); portal strip |
| `/messages`, `/messages/[projectId]` | Live. Chat-style portal conversation inbox + reply |
| `/products`, `/products/new` | Live. Own-product records only |
| `/playbook` | Live on Desk. Public scratch page is gone |
| `/style` | Live specimens. Live header is the account-menu specimen |
| `/export`, `/export/download` | Live. JSON, YAML, CSV zip, Markdown, HTML |
| `/profile` | Live. Self-edit, password, optional authenticator, devices; owner adds / deactivates operators |
| `/profile/photo/[id]` | Live. Session required. Static photos: `/avatars/` |
| `/api/inbound-lead` | Live. Public CORS POST from nusman.dev `/start` |

### Portal host (`portal.*` / `portal.localhost`)

| Route | Status |
|---|---|
| `/`, `/login`, `/auth/magic` | Live |
| `/profile` | Live. Read-only person details; account chip matches Desk |
| `/projects`, `/projects/[id]` | Live. Progress, your package (client fields), updates, schedule strip |
| `/schedule` | Live. Wide hub: Cards / Calendar; confirm/decline/cancel; request |
| `/projects/[id]/intake`, `/messages`, `/schedule` | Live |

### Schema

Migrations on Neon **nusmandotdev** (`sparkling-art-67399165`) only:

| File | What |
|---|---|
| `0000_init` | Core tables including `users` |
| `0001_activities` | Personal journal (`activities`) |
| `0002_work_kind` | Hiring vs own-product |
| `0003_gate_records` | Qualify, intake, discovery, agree, changes, demos, launch |
| `0004_audit_events` | Audit trail |
| `0005_audit_detail` | `before` / `after` jsonb, optional `reason` |
| `0006_users_profile` | User profile columns + `sessions` |
| `0007_totp` | Optional authenticator columns on `users` |
| `0008_portal` | Portal magic links, sessions, messages; note/intake/person flags |

Apply from `admin/` with `npm run db:migrate`. Do not point `DATABASE_URL` at Mineaid, Uventory, church, or any other Neon project.

### Auth (as built)

- Cookie `desk_session`: JWT HS256, 14 days, claims `email`, `uid`, `sid`.
- Cookie `portal_session`: JWT for a `people` row; magic links are one-time.
- Proxy and all Desk pages/actions require a live `sessions` row. Revoked or expired cookies are cleared.
- Env `ADMIN_PASSWORD` only works while the owner’s `password_hash` is empty (bootstrap). After that, hash only.
- Optional TOTP on Profile. After password, login asks for a 6-digit code or a one-time recovery code. `drizzle/0007_totp.sql`.
- Public without Desk login: `/_next/*`, favicons, `/logos/`, `/favicon/`, `/avatars/`, `POST /api/inbound-lead`.
- Photos: PNG / JPEG / WebP, max 400 KB. `image_url` (seeded `/avatars/numan.png`) or `image_data` + `image_mime`. Server actions body limit 1 MB.
- Exports omit `password_hash`, `image_data`, and TOTP secrets. `sessions` is not exported.
- Login failures: 5 per IP per 15 minutes, in memory, per server instance.

### Chrome (as built)

Main nav: Today, Audit, Clients, Projects, **Schedule**, Messages, Products, Playbook, Style, Export.

Account menu (last nav item): grey chip (`bg-gray-100 hover:bg-gray-200`), no gold ring except focus. Opens Profile, Journal, Sign out. Inline SVG icons (person, book, door). Journal is not in the main nav so it is not confused with sign-in or Audit.

Portal header mirrors Desk chrome; account chip opens Profile and Sign out.

Header: hamburger `<500px`; stacked centred logo + wrapping nav `500–1023px` (logo in normal flow); one row `1024px+`.

Deletes and other critical actions confirm first. Project and product delete requires typing the title. Confirm dialogs portal to `document.body` so table `overflow-hidden` does not clip them.

---

## Open gaps

These are leftover product work, not bugs in the last UI pass.

### Operators

- Owner can add, deactivate, and reactivate operators. There is **no** UI to edit another operator’s name, photo, phone, or title.
- Owner cannot set or reset another operator’s password. That person uses their own Profile after the owner-created password.
- Users are not deleted. Deactivate only. The owner row cannot be deactivated.
- If `password_hash` is still empty, the owner signs in with `ADMIN_PASSWORD`; the first successful env login writes the hash. After that the env password no longer works. Change-password on Profile needs a hash. `npm run db:seed` also hashes when the column is empty.

### Sessions

- Expired `sessions` / `portal_sessions` rows are not swept. They stop working; they stay in the table until revoked or the person/user is removed.
- Cookies without a live `sid` are rejected. Sign in again after a revoke or after upgrading from an older cookie.

### Portal / messages

- No unread badges or email on new portal messages.
- Operator replies do not store which operator wrote them (`author_kind` only).
- Chosen package with leftover coaching text in `summary` must be rewritten on Desk before Choose / before Portal looks complete.

### Security (intentional for v1)

- Authenticator is optional, not required for every operator.
- Login / inbound rate-limits are per instance (in memory). Multiple Vercel instances do not share the counter.
- Desk and Portal are findable if someone guesses the host. Login / invite is the control.

### Data / ops

- Neon automatic snapshots are off on this project plan. Download `/export` after a real job starts.
- Product databases are **not** imported. Do not copy their `DATABASE_URL` into Desk.
- CSV zip file for journal lines is `journal.csv`. Audit action codes for those rows are still `log.create` / `log.update` / `log.delete` (machine names; the UI says Journal).

### Tooling (not an app bug)

Cursor’s in-IDE browser injects `data-cursor-ref` on DOM nodes. That can show a React hydration overlay in the Cursor browser. Check the same page in Chrome or Edge before treating it as a Desk bug.

---

## Next

Not a new phase unless you choose one:

1. Invite a real client to Portal; rewrite any package summaries that still use coaching starters.
2. Keep an export after a real job starts.
3. Add other operators from Profile when you need them.
4. Later, import product databases — only when you choose to, and never by pointing Desk at their `DATABASE_URL`.

Possible later work if you ask for it: unread message badges; operator identity on replies; owner edit / password-reset for other operators; sweep expired sessions; require authenticator for all operators; Neon snapshots; product-data import.
