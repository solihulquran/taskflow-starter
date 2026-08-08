# TaskFlow

**Day 4 · IoTBTech React Deep Dive**

A real task board. Sign up, get a board, add tasks, drag them between columns —
then deploy the whole thing to a public URL you can send to anybody.

---

## Why this one is different

For three days, everything you built lived in `useState`. Which means every
single app died the moment you hit refresh.

| | Day 1–3 | Tonight |
|---|---|---|
| Where the data lives | Your browser tab's memory | A real PostgreSQL database |
| Survives a refresh | ❌ | ✅ |
| Works on your phone too | ❌ | ✅ |
| Other people can use it | ❌ | ✅ Each with their own private board |
| Lives on the internet | ❌ | ✅ Your own URL |

By the end of the session you will have built, and **deployed**, a full-stack
application. That URL goes on your CV this week.

**What you'll learn along the way:** React Hook Form + Zod for forms that don't
hurt, TanStack Query for data that comes from a server, Next.js Server
Components, and enough about databases and security to be dangerous.

---

# PART 1 — Do this BEFORE the session

**Takes about 30 minutes, most of it waiting for downloads.** Doing it live
means you'll spend the session watching other people build.

> If anything here fails, **post the error in the group the day before.** Not
> at 8:30pm on the night.

---

## Step 0 · Check your Node version

```bash
node -v


You need **v20 or higher**. Older? Install the current LTS from
<https://nodejs.org>.

---

## Step 1 · Install the project

```bash
cd lab-taskflow
npm install
```

> **You will see a scary message.** `npm audit` reports a few "high severity"
> issues in `postcss` and `sharp`. Those belong to Next.js, not to us, and the
> suggested fix downgrades Next.js to version 9 — which would break everything.
> **Do not run `npm audit fix --force`.** Ignore it and move on.

Don't run the app yet. It has no database to talk to.

---

## Step 2 · What is a backend? (5 minutes of reading — don't skip)

Ask yourself: **where has your data lived for the last three days?**

In `useState`. And `useState` lives in your browser tab's memory. Close the
tab and it's gone. Which means every app you've built so far is an app for
exactly one person, for exactly as long as they don't refresh.

That's not an app. That's a demo.

For data to survive, it has to leave your computer and live on a computer that
never turns off. That computer is called a **server**. The code running on it
is called the **backend**.

Every backend does three things:

```
     ┌───────────────────────────────────────────────────┐
     │                  THE BACKEND                      │
     │                                                   │
     │   1. DATABASE   stores the data, forever          │
     │   2. API        a door your app knocks on         │
     │   3. AUTH       who are you? what may you see?    │
     └───────────────────────────────────────────────────┘
                            ▲
                            │   fetch()
                            │
                      Your React app
```

Storage, a door, and a bouncer. That's it.

From **Class 31** you'll build all three yourself with Node.js, Express and
PostgreSQL. That's real, and you will do it.

But that's weeks away, and tonight you're shipping a real app. So we rent all
three.

---

## Step 3 · What is Supabase, and why are we using it?

**Supabase is those three boxes, already built, free, ready in ninety seconds.**

Underneath it is **PostgreSQL** — write that name down. Postgres is the most
widely used serious database in the world: Instagram, Spotify, Netflix, your
bank. It is not a training-wheels version. It's the real thing, and it's the
same database you'll install on your own machine later in the syllabus.

### If you've never seen a database, start here

You already understand spreadsheets. A database is a stricter spreadsheet:

| Google Sheets | Database | In TaskFlow |
|---|---|---|
| A spreadsheet file | A **database** | your Supabase project |
| A sheet / tab | A **table** | `tasks` |
| A column | A **column**, with a fixed type | `title` is text, `due_date` is a date |
| A row | A **row** — one record | one task |
| A formula | A **query**, written in SQL | "give me the tasks in project X" |

The difference is that a database is strict about types, never corrupts itself,
handles ten thousand people writing at once, and — the important one — **can
enforce rules about who is allowed to read which rows.**

### The part that feels like cheating

In Class 32 you'll spend a week writing endpoints by hand: `GET /tasks`,
`POST /tasks`, `PATCH /tasks/:id`.

Supabase looks at your tables and **generates that API automatically**. You
create a table called `tasks`, and instantly there's an API for tasks. That's
why tonight has no backend code in it, but still has a real backend.

### "So are we skipping the learning?"

No — and this matters, so read it properly.

Tonight you use **tables, rows, columns, relationships, queries, logins and
security rules.** Those are the *hard* parts of backend, and they are identical
in every stack you will ever touch.

What you're skipping is the *plumbing*. And in Class 31 you'll build that
plumbing — except you'll already know what it's for. This is scaffolding, not
a shortcut.

*(If you're wondering how this compares to Firebase: same idea, different
shape. Firebase stores documents. Supabase gives you real SQL tables with
relationships and constraints — which is what our syllabus teaches anyway, so
what you learn tonight transfers directly.)*

---

## Step 4 · Create your Supabase project

1. Go to <https://supabase.com> → **Start your project**
2. Sign in **with GitHub** (you'll need the same account for deployment later)
3. **New project**
   - **Name:** `taskflow`
   - **Database password:** click generate, and **save it somewhere.** You
     won't need it tonight, but you cannot get it back.
   - **Region:** pick the closest one to you — for Nigeria, **Europe (London)
     / eu-west** is usually the fastest of the options
4. Click **Create new project**

**It takes about 2 minutes to provision.** Go and make tea.

> ⚠️ **A free organisation allows two active projects.** If you already have
> two, pause one or create a new organisation. Find that out now, not during
> the session.

> 💳 No credit card. The free tier is genuinely free. It pauses a project after
> a week of no activity — you click "restore" and it comes straight back.

---

## Step 5 · Two settings you must change

Miss these and nothing works.

### 5a · Turn OFF email confirmation

**Authentication → Sign In / Providers → Email → uncheck "Confirm email" →
Save**

By default Supabase emails you a confirmation link before you can log in.
That's correct for a real product — but free-tier email is slow and
rate-limited, and you'd spend the session refreshing a spam folder.

> **In a real product, leave this ON.** We're turning it off for the workshop
> only.

### 5b · Leave everything else alone

Genuinely. Don't explore the settings yet.

---

## Step 6 · Create the database

This is the fun bit. You're about to create three tables, two triggers and
eight security policies with one paste.

1. In the Supabase dashboard, open **SQL Editor** (left sidebar)
2. Click **New query**
3. Open `supabase/schema.sql` from this project, **copy the whole file**
4. Paste it into the editor and hit **Run**

You should see *Success. No rows returned.* That's what success looks like for
a script that creates things.

### What did you just run?

Open the file and read it — it's commented line by line. Four ideas:

**1. Three tables.** `profiles` (one row per human), `projects` (a board),
`tasks` (the cards). Notice that `tasks` has a column `project_id` pointing at
`projects.id` — that's a **foreign key**, meaning "this task belongs to that
project." That's the *relational* in relational database.

**2. Constraints — validation nobody can bypass.**

```sql
title text not null check (char_length(title) between 3 and 120),
status text not null default 'todo' check (status in ('todo','in_progress','done')),
```

The database itself refuses a task with a 2-character title, or a status of
`banana`. Later you'll write the *same* rules again in Zod for the form. Two
layers on purpose: Zod gives a friendly red message in the UI, the database
makes it impossible. **Validate at every boundary.**

**3. Triggers — automation living in the database.** When you sign up, a
trigger automatically creates your profile, a starter board, and three sample
tasks. No React code runs. The database does it.

**4. Row Level Security — the most important idea in the whole session.**

```sql
alter table public.tasks enable row level security;

create policy "tasks: read in own projects"
  on public.tasks for select
  using (public.owns_project(project_id));
```

In English: *"you may read a task only if you own the project it belongs to."*

Why does that matter so much? Because of the next step.

### Check your work

Open **Table Editor**. You should see `profiles`, `projects` and `tasks` — all
empty, and **none of them carrying a red "Unrestricted" badge.**

That badge means Row Level Security is off and the table is readable by the
entire internet. On a real project, that badge is a security incident.

---

## Step 7 · Connect the app to your database

### 7a · Find your keys

Supabase dashboard → **Project Settings → API** (sometimes labelled
**API Keys**). You need two values:

| What | Looks like |
|---|---|
| **Project URL** | `https://abcdefgh1234.supabase.co` |
| **anon public** key (may be labelled **Publishable key**) | a very long string starting `eyJ…` or `sb_publishable_…` |

### 7b · Put them in `.env.local`

```bash
cp .env.example .env.local
```

Then open `.env.local` and paste:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh1234.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

No quotes. No spaces. No trailing newline inside the value.

### 7c · 🔑 The key rule you never break

Supabase gives you **two** kinds of key. Understand the difference before you
touch either.

| Key | Where it goes | If it leaks |
|---|---|---|
| **anon / publishable** | Your React code, the browser, GitHub | Fine. It is *designed* to be public |
| **service_role / secret** | **Nowhere near a React app.** Server-only | Total compromise. Anyone can read and delete every row |

**The rule:** if an environment variable name starts with `NEXT_PUBLIC_`,
assume it is printed on a billboard. Never put a secret key in one.

`.env.local` is in `.gitignore`, so your keys never reach GitHub.
`.env.example` — the empty one — *is* committed, so the next developer knows
which variables to fill in. That's the convention on every professional team:
**commit the shape, never the values.**

### 7d · "Wait — if the public key is in my browser, what stops someone stealing it?"

Good. That's exactly the right question, and it's why Step 6 mattered.

You might think the answer is to write `if (task.userId === currentUser.id)` in
React. **It isn't.** That's not security, it's a *suggestion* — anyone can open
DevTools and delete your `if`, or skip your app entirely and call the API with
`curl`.

Real security lives in the database. That's what those Row Level Security
policies are: rules on the table itself. Steal the key, write your own app,
use curl — Postgres still hands back an empty list, because *you're not the
owner of those rows.* The bouncer is on the door of the vault, not the door of
the building.

> **Client-side checks are for user experience. Database rules are for
> security. Never confuse the two.**

You'll see this proved live in the session with two browser windows.

---

## Step 8 · Run it

```bash
npm run dev
```

Open <http://localhost:3000>. You should be redirected to `/login`.

1. **Create an account** with any email and a password (6+ characters). It
   doesn't need to be a real inbox — we turned confirmation off.
2. You land on `/projects` and see a board called **My First Board**. Nobody
   created that. The database trigger did.
3. Click into it. You'll see **three orange TODO panels** instead of tasks.

**That is correct.** Those panels are the parts you build in the session.

### Confirm it really worked

Go back to the Supabase dashboard → **Table Editor**:

- `profiles` — one row. You.
- `projects` — one row. Your board.
- `tasks` — three rows.

Your React app just talked to a real PostgreSQL database. 🎉

---

## ✅ Pre-session checklist

- [ ] `node -v` shows v20 or higher
- [ ] `npm install` finished
- [ ] Supabase project created
- [ ] "Confirm email" turned **off**
- [ ] `schema.sql` run — three tables visible, no "Unrestricted" badges
- [ ] `.env.local` filled in with your URL and anon key
- [ ] `npm run dev` works, you signed up, you can see **My First Board**
- [ ] Rows visible in the Supabase Table Editor
- [ ] A free **Vercel** account created (<https://vercel.com>, same GitHub) —
      that's where your app goes live at the end of the night

**Come to the session with all of that done and the app running.**

---

# PART 2 — What you build in the session

The starter ships with the **plumbing finished** so that every minute of the
session goes on the four things Day 4 is actually about: forms, server state,
server components, and shipping.

**Already written for you** — read it, don't retype it:

```
src/lib/supabase/       three clients: browser, server, middleware
src/middleware.ts       auth guard for every route
src/lib/env.ts          environment variables, validated with Zod at startup
src/types/database.ts   TypeScript types that mirror the SQL schema
src/app/globals.css     the whole design system
src/components/ui/      Button, Field, Input, Skeleton, ErrorPanel, EmptyState
src/app/login/          sign in / sign up (deliberately written the OLD way —
                        five useStates for two fields. You'll see why)
src/lib/query-keys.ts   the cache-key factory
supabase/schema.sql     tables, constraints, triggers, RLS policies
```

**You write these eight.** Each is marked with a `TODO n` comment block that
explains what to build and why, and lists the imports you'll need:

| TODO | File | What |
|---|---|---|
| 1 | `src/lib/api/tasks.ts` | The data layer — plain functions, no React |
| 2 | `src/hooks/useTasks.ts` | `useQuery` — read the board |
| 3 | `src/app/(app)/projects/[id]/Board.tsx` | Render it, all four states |
| 4 | `src/lib/validation/task.ts` | The Zod schema |
| 5 | `src/components/tasks/TaskForm.tsx` | React Hook Form + `zodResolver` |
| 6 | `src/hooks/useCreateTask.ts` | `useMutation` + cache invalidation |
| 7 | `src/hooks/useUpdateTaskStatus.ts` | Optimistic updates |
| 8 | `[id]/page.tsx` + `loading.tsx` + `error.tsx` | Next.js conventions |

Find them all at any time:

```bash
grep -rn "TODO [0-9]" src/
```

> The app **runs fine** with every TODO still untouched. So if you fall behind,
> you always have a working app — and if the build breaks, it's something you
> just typed.

---

# PART 3 — Reference

## Commands

```bash
npm run dev          # start the dev server → http://localhost:3000
npm run build        # exactly what Vercel runs. Run it BEFORE you push
npm run typecheck    # types only, much faster than a full build
```

**The rule you will forget:** Next.js reads `.env.local` **once, at startup**.
Every time you edit that file — stop the dev server, start it again.

## Project structure

```
src/
├── app/                    routes — every folder with page.tsx is a URL
│   ├── login/              public
│   └── (app)/              route group: signed-in pages share this layout
│       └── projects/
│           ├── page.tsx    server component — the project list
│           └── [id]/       the board
├── components/
│   ├── ui/                 presentational only
│   ├── layout/
│   └── tasks/
├── hooks/                  TanStack Query hooks
├── lib/
│   ├── api/                how to talk to the database
│   ├── supabase/           the three clients
│   ├── validation/         Zod schemas
│   └── query-keys.ts
└── types/database.ts
```

**One rule explains the whole tree:** `lib/` doesn't know React exists,
`hooks/` doesn't know SQL exists, and components know neither. Three layers,
one job each. When something breaks you know which file to open — and you could
swap Supabase for your own Express API later by rewriting a single folder.

## When something breaks

| Symptom | Cause / fix |
|---|---|
| Query returns `[]` but rows exist in Supabase | **Row Level Security.** Suspect it first, every single time |
| Signed up, but `/projects` is empty | You signed up *before* running `schema.sql`, so the trigger didn't exist. Delete the user (Authentication → Users) and sign up again |
| `Invalid API key` | Whitespace, quotes, or a partial paste in `.env.local` |
| Edited `.env.local`, nothing changed | Restart the dev server. Next reads env at startup |
| `Environment is not configured` on boot | `.env.local` is missing or a value is empty. The error message tells you which |
| Signed in, bounced straight back to `/login` | Missing `router.refresh()` after sign-in |
| `params.id is undefined` | Next 15 made `params` a Promise — `await` it |
| `useState only works in a Client Component` | Missing `'use client'` at the top of the file |
| `Error components must be Client Components` | `error.tsx` needs `'use client'` |
| Mutation works, list doesn't update | Query-key mismatch. Open the React Query Devtools (bottom-left flower icon) |
| Works locally, auth broken on Vercel | Add your Vercel URL to Supabase → Authentication → URL Configuration |

## Homework

1. **Ship it properly** — a README with a screenshot and the live link, pinned
   on your GitHub profile.
2. **Optimistic delete** — `useDeleteTask` is written the simple way. Give it
   the same treatment as TODO 7. 
3. **Edit a task** — reuse `TaskForm` for both create and edit. Hint: an
   optional `task` prop feeding `defaultValues`.
4. **Create projects** — right now a trigger makes your first board. Build the
   form that makes the rest.
5. **Search and filter** — a text input plus a status filter, memoised with
   `useMemo`.
6. **Stretch: teams** — add a `project_members` table so two people share a
   board. The RLS policy stops being "am I the owner" and becomes "am I a
   member".
7. **Stretch: realtime** — uncomment the last line of `schema.sql`, subscribe
   with `supabase.channel(…)`, and call `invalidateQueries` when a change
   arrives. Two browsers, one board, live.

---

## Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Backend | Supabase — PostgreSQL, Auth, Row Level Security |
| Server state | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Deploy | Vercel |

Versions are **pinned exactly** (no `^`) so that everyone in the session runs
byte-identical code. In your own projects, use `^`.
