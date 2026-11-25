# CabinMUJ

Find any Manipal University Jaipur faculty member — and their block, floor and cabin — in seconds.
Students search and browse; an admin keeps the data accurate.

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in the admin username and password
npm run dev                   # http://localhost:3000
```

- Public site: `/`, `/faculty`, `/departments`, `/blocks`, `/report`, `/about`
- Admin panel: `/admin` (sign in with the credentials from `.env.local`)

## Configuration (`.env.local` or your host's environment)

| Variable | Required | Purpose |
| --- | --- | --- |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | yes | Admin login. The username is case-insensitive. |
| `ADMIN_SESSION_SECRET` | recommended | Signs the admin session cookie (`openssl rand -hex 32`). If unset, a random secret is generated and kept in `data/.session-secret`. Changing it signs everyone out. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | no | Where students' "Email an update" messages go (default `cabinmuj@gmail.com`). |
| `CABINMUJ_DATA_DIR` | no | Folder for the data file (default `./data`). |

Credentials are only ever read on the server; they are never sent to the browser. Keep them out of git
(`.env*` files are ignored, except `.env.example`).

## Admin panel

- **Dashboard** — totals, how many cabin locations are verified, pending student reports, recent changes.
- **Faculty** — search/filter all faculty; add, edit or delete; one-click "mark location verified".
  The editor warns about unsaved changes, detects edits made in another tab, flags likely duplicates,
  and supports Ctrl/⌘ + S. Deleting can be undone (toast "Undo", or **History → Restore**).
- **Requests** — reports students send from the update form. "Open in editor" shows the report next to
  the record; saving resolves it. You can also reject/reopen, and reply to the student by email.
- **History** — every change with before/after values.
- **Download backup** — `/admin/export` returns all data as JSON.

Every admin page and server action verifies the session on the server. "Log out" signs the admin out on
every device. Failed logins and public report submissions are rate-limited per address and site-wide (so
faking an address doesn't help), and every input is validated on the server.

## Data

All data lives in one JSON file, `data/cabinmuj-db.json` (faculty, student reports, change history).
It is created on the first run from `src/lib/mock-data.ts`; after that **the admin panel is the source of
truth** — edit faculty there, not in `mock-data.ts`. Each save is written atomically and the previous
version is kept as `cabinmuj-db.json.bak`.

> **Cabin locations in the seed data are placeholders.** `scrape_faculties.py` scraped names, designations,
> departments and photos from the MUJ website but assigned block/floor/cabin **at random**. Every record
> therefore starts as "unverified" (students see a notice). Use **Faculty → Location unverified** in the
> admin panel to confirm or correct them. Re-running the script regenerates random cabins in
> `mock-data.ts` (it does not touch the live data file).

## Deploying

The app needs a server with a **persistent, writable disk** for `data/` — e.g. a VPS, a Docker container
with a volume, or a platform disk (Railway, Render, Fly.io):

```bash
npm ci && npm run build
ADMIN_USERNAME=… ADMIN_PASSWORD=… ADMIN_SESSION_SECRET=… npm start
```

Run it as **one** server process (no cluster mode / multiple replicas): saves are serialized and rate limits
are counted inside the process. If you put it behind a reverse proxy, have the proxy set `X-Real-IP` so
per-address limits see real client addresses.

Serverless hosts with read-only or ephemeral filesystems (such as Vercel) can serve the site, but admin
saves would fail there (the admin sees a clear error). To host there, replace the storage in
`src/lib/server/store.ts` with a database — it is the only file that touches storage.

## Project structure

```
src/app/                 pages (public site, /admin, /admin/export)
src/components/          UI (admin/, faculty/, home/, layout/, report/, ui/)
src/lib/actions/         server actions (admin edits, public reports)
src/lib/server/          storage, session/auth, validation, rate limiting (server-only)
src/lib/                 shared types, search, formatting, mailto helpers
```

Scripts: `npm run dev`, `npm run build`, `npm start`, `npm run lint`.
