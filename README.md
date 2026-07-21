# Roomsync — Advanced Roommate Finder

A roommate-matching app built to go beyond a filter list: every profile shows a **computed compatibility score** (not just tags), swipe-based discovery, mutual-match creation, and in-app messaging between matches.

## What makes it "advanced"

- **Compatibility algorithm, not a filter list** (`src/lib/matching.ts`) — a 0–100 score from weighted overlap of budget range, move-in timing, cleanliness, schedule, and social level, where pets/smoking mismatches act as **hard-filter multipliers** that cap the whole score rather than just subtracting a few points. The full breakdown (not just the final number) is computed and available per candidate.
- **Swipe-based discovery** (`src/app/(app)/discover/`) — Framer Motion drag-to-swipe cards, ranked by compatibility score, with a match celebration overlay when two people like each other.
- **Real matches + messaging** — a mutual like creates a `Match` row; matched users get a conversation thread (`src/app/(app)/matches/[id]/`), polling every 4s for new messages.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4, Prisma + SQLite, custom JWT-cookie auth (see below), Framer Motion.

> **Note on Next.js/Prisma versions**: `create-next-app` and `npm install prisma` pulled in Next.js 16 and Prisma 7 — both meaningfully newer than typical training-data conventions (Next renamed `middleware.ts` → `proxy.ts` and made `params`/`cookies()` async-only; Prisma 7 moved the datasource URL out of `schema.prisma` into `prisma.config.ts` and now requires an explicit driver adapter even for SQLite). This project is written against the current APIs, not the older conventions.

### Why custom auth instead of NextAuth

The original plan called for NextAuth (Auth.js). Given how new Next.js 16 is, I implemented a small, fully-owned auth layer instead (`src/lib/auth.ts`: bcrypt password hashing + a `jose`-signed JWT in an httpOnly cookie, checked in `proxy.ts` for route protection) rather than risk an auth library's compatibility assumptions about `middleware.ts` on a Next.js version it may not have been tested against yet. It's a deliberate trade-off: less "batteries included," but zero library-compatibility risk on a bleeding-edge framework version.

## Running it

```bash
npm install
npx prisma migrate dev    # creates prisma/dev.db and applies the schema
npx prisma db seed        # seeds 8 demo roommate profiles (see below)
npm run dev
```

Open http://localhost:3000/, sign up, fill out your preferences on `/profile`, then go to `/discover`.

### Demo accounts

`npx prisma db seed` creates 8 demo profiles (mostly in Austin, TX, one each in Seattle and Denver, varied budgets/schedules/cleanliness/pets/smoking) so Discover isn't empty on a first run. Every seeded account uses the password `password123` — email addresses look like `demo.jordan@roomsync.test` (see `seed/seed.ts` for the full list). Log into two different seeded accounts in separate browser sessions (or one normal + one incognito window) to test a real mutual like → match → message flow between two accounts, not just against yourself.

## Known limitations (stated plainly)

- **No photo upload** — avatars are initials in a colored circle. Adding real photo upload would mean file storage (S3/local disk) for a feature that isn't the portfolio centerpiece here.
- **No map/geolocation search** — location is a plain text field matched by exact string, not distance. Avoids requiring a maps API key from whoever runs this.
- **Messaging polls every 4 seconds, it isn't a websocket.** A real-time transport (websockets/SSE) would be the natural next step, but is a substantial infra add for a feature that isn't the centerpiece.
- **SQLite, not Postgres** — zero-setup by design. Prisma's schema is DB-agnostic; switching datasources is a small, contained change if this needs to run against Postgres later.
