# PulseMail

PulseMail is a small email marketing app — like a simple version of Mailchimp. You can sign up, import contacts, group them into audiences, send email campaigns, and see how those campaigns performed (sent, delivered, opened).

This project is built as a **monorepo** with two separate apps:
- `frontend/` — the website (Next.js)
- `backend/` — the API server (Express)

They talk to each other over HTTP. The backend is **not** inside Next.js API routes, as required by the assignment.

---

## Live demo

| | URL |
|---|---|
| **App** | https://pulsemail-app.vercel.app |
| **GitHub** | https://github.com/Vikas0262/pulsemail-app |
---

## What you need before running

| Requirement | Why |
|-------------|-----|
| **Node.js 20+** | Runs the frontend and backend |
| **A Postgres connection string** | We used Supabase (free tier) — any managed Postgres works |
| **A Redis connection string** | We used Upstash (free tier) — any managed Redis works |
| **Resend account** (free) | Sends emails and delivers webhooks for delivered/opened tracking |

You don't need to install Postgres or Redis locally — sign up for free accounts at [supabase.com](https://supabase.com) and [upstash.com](https://upstash.com), then paste the connection strings into your `.env` file.

---

## Tech stack (and why)

| Part | What we used | Why |
|------|--------------|-----|
| Frontend | **Next.js 16** + **React** + **Tailwind CSS** | Required by assignment. Next.js gives a fast, modern UI. Tailwind makes styling quick and consistent. |
| Backend | **Express 5** + **TypeScript** | Required by assignment. Express is simple and keeps the API separate from the frontend. |
| Database | **PostgreSQL** + **Prisma** | Required by assignment. Postgres is reliable for relational data. Prisma makes database queries type-safe and easy. |
| Queue | **Redis** + **BullMQ** | Required by assignment. Scheduled campaigns are stored as delayed jobs in Redis — they survive server restarts and are not faked with `setTimeout`. |
| Email | **Resend** | Assignment allows any provider with open tracking + webhooks. Resend has a free sandbox (`onboarding@resend.dev`) so you don't need your own domain. |
| Auth | **JWT** + **bcrypt** | Each user belongs to one account (workspace). Passwords are hashed. Every API route checks the token and only returns that account's data. |

---

## How to run locally

You need **two terminals** — one for the backend, one for the frontend.

### Step 1 — Backend setup

```bash
cd backend
npm install
```

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Run database migrations:

```bash
npx prisma migrate dev
```

Start the API server (this also starts the BullMQ worker for sending emails):

```bash
npm run dev
```

The backend runs at **http://localhost:5000**.

### Step 2 — Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

The frontend runs at **http://localhost:3000**.

### Step 3 — Try it out

1. Open http://localhost:3000
2. Sign up with a new account
3. Go to **Contacts** → import `mock-data/contacts.csv`
4. Go to **Audiences** → create a group (e.g. filter by tag `vip`)
5. Go to **Campaigns** → create a campaign → add recipients → send
6. Open **Performance** tab to watch analytics update live

---

## Environment variables

Never commit your `.env` files. Use the example files as a template.

### Backend (`backend/.env`)

| Variable | What it does |
|----------|--------------|
| `DATABASE_URL` | Pooled Postgres connection (Supabase transaction mode, port 6543) — used at runtime |
| `DIRECT_URL` | Direct Postgres connection (Supabase session mode, port 5432) — used only for migrations |
| `REDIS_URL` | Redis connection, e.g. `redis://localhost:6379` |
| `JWT_SECRET` | Secret key used to sign login tokens — use a long random string |
| `RESEND_API_KEY` | Your Resend API key for sending emails |
| `PORT` | Backend port (default `5000`) |

Example:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/pulsemail
DIRECT_URL=postgresql://user:password@localhost:5432/pulsemail
REDIS_URL=redis://localhost:6379
JWT_SECRET=change-me-to-a-long-random-string
RESEND_API_KEY=re_your_key_here
PORT=5000
```

### Frontend (`frontend/.env.local`)

| Variable | What it does |
|----------|--------------|
| `NEXT_PUBLIC_API_URL` | URL of your backend API, e.g. `http://localhost:5000` |

---

## Resend webhooks (needed for analytics)

Analytics for **delivered** and **opened** counts come from Resend webhooks — not from guessing.

### Local development

Your backend must be reachable from the internet. Use [ngrok](https://ngrok.com/):

```bash
ngrok http 5000
```

Then in the **Resend dashboard** → Webhooks → Add webhook:

- **URL:** `https://your-ngrok-url/api/webhooks/resend`
- **Events:** `email.delivered`, `email.opened`

### Production

Point the webhook to your deployed backend:

```
https://your-backend-url/api/webhooks/resend
```

> **Note:** Resend's sandbox sender (`onboarding@resend.dev`) only delivers to email addresses you verify in the Resend dashboard. Add your test email there before sending campaigns.

---

## Features (mapped to assignment)

### Auth and workspaces
- Sign up and log in
- Each account is fully isolated — all API queries filter by `accountId` on the server, not just in the UI

### Contacts
- Add, edit, delete contacts (name, email, phone, city, tags)
- **Custom fields** — any extra key/value you want (stored as JSON)
- **CSV import** — use `mock-data/contacts.csv` to test
- Duplicates (same email or phone) are **skipped**, and the UI tells you: `"12 added, 3 skipped as duplicates"`

### Audiences
- Save a named group by filtering contacts (city, tag, custom field, etc.)
- Shows how many contacts match right now

### Campaigns
- Create a campaign with name, subject, and body
- Pick recipients two ways:
  1. **Audience or tag** — select a saved audience or filter by tag
  2. **Paste a list** — paste emails or phone numbers; matched contacts show their name, unmatched ones are flagged
- **Send now** or **schedule for later** — scheduled sends go through BullMQ + Redis (real queue, not `setTimeout`)

### Analytics
- Each campaign has a **Performance page** at `/campaigns/[id]/analytics`
- Shows: sent, delivered, opened (plus failed/pending)
- Page **auto-refreshes every 4 seconds** so you can watch numbers go up without reloading
- Delivered/opened counts come from Resend webhooks

---

## Test data

The file `mock-data/contacts.csv` is included for testing imports. It has:
- Standard columns: name, email, phone, city, tags
- Extra columns (`company`, `role`) that become **custom fields**
- **Intentional duplicates** (same email or phone repeated) to test duplicate handling

---

## Project structure

```
pulsemail-app/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Database models
│   └── src/
│       ├── controllers/        # Route handlers (contacts, campaigns, etc.)
│       ├── middleware/         # JWT auth middleware
│       ├── queues/             # BullMQ queue setup
│       ├── workers/            # Email sending worker
│       ├── services/           # Resend email service
│       └── utils/              # Shared helpers (audience filters)
├── frontend/
│   ├── app/
│   │   ├── contacts/           # Contacts page
│   │   ├── audiences/          # Audiences page
│   │   ├── campaigns/          # Campaign list, create, detail, analytics
│   │   ├── login/              # Login page
│   │   └── signup/             # Signup page
│   └── components/             # Shared UI (sidebar, analytics panel)
└── mock-data/
    └── contacts.csv            # Sample import file
```

---

## Deployment

Suggested setup (all have free tiers):

| Service | What to deploy |
|---------|----------------|
| **Vercel** | Frontend (`frontend/` folder) — set `NEXT_PUBLIC_API_URL` to your backend URL |
| **Railway** or **Render** | Backend — needs Postgres + Redis add-ons |
| **Upstash** | Redis (alternative if your host doesn't include Redis) |

Important:
- The **BullMQ worker** runs inside the backend process (imported in `backend/src/index.ts`). Deploy backend as one service so scheduled jobs actually run.
- Set all backend env vars on your host.
- Point Resend webhooks to your production backend URL.

### Build commands

**Backend:**
```bash
cd backend
npm install
npx prisma migrate deploy
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run build
npm start
```

---

## Decisions and trade-offs

These are choices made during the project and things that were skipped:

| Topic | Decision |
|-------|----------|
| **Email provider** | Used **Resend** instead of Mailgun/Brevo. Assignment allows any provider with webhooks. Resend is easy to set up without a custom domain. |
| **Duplicate contacts** | Skipped on import and manual add (not merged). User sees a clear count of added vs skipped. |
| **Scheduling** | BullMQ delayed jobs in Redis. Jobs persist across restarts as long as Redis is running. |
| **Account isolation** | Every protected route reads `accountId` from the JWT and filters all database queries. |
| **Custom fields** | Stored as JSON on the contact — flexible without changing the database schema. |
| **Analytics counting** | Recipient status is one field (`pending → sent → delivered → opened`). Opened recipients no longer count under "delivered" — good enough for a demo. |
| **Campaign duplicate button** | Not implemented (extra credit item). |
| **PDF attachments** | Not implemented (extra credit item). |

---

## Scripts reference

### Backend
| Command | What it does |
|---------|--------------|
| `npm run dev` | Start API + worker in watch mode |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled production build |

### Frontend
| Command | What it does |
|---------|--------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Run production build |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Backend won't start — Redis error | Make sure Redis is running and `REDIS_URL` is correct |
| Database error on start | Run `npx prisma migrate dev` in the backend folder |
| Emails not sending | Check `RESEND_API_KEY` and verify recipient emails in Resend dashboard |
| Delivered/Opened stay at 0 | Webhook not configured — set up Resend webhook pointing to your backend |
| Frontend can't reach API | Check `NEXT_PUBLIC_API_URL` matches your backend URL |
| CORS errors in production | Backend has CORS enabled; make sure the frontend URL is allowed if you restrict it |

---

## License

This is a take-home assignment project.
