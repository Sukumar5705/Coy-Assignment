# Coy Discover

Next.js app (frontend + API) for the Coy Discover swipe feature: a feed of unswiped profiles, like/pass swipes, mutual matching, and a hard guarantee that a one-sided like is never visible to anyone.

**Stack:** Next.js 15 (App Router API routes) · Prisma 6 · SQLite · Zod · TypeScript

## Quick start (Node 20+)

```bash
npm install
cp .env.example .env          # DATABASE_URL="file:./dev.db"
npm run setup                 # applies migrations + seeds 31 profiles (11 already like the demo user)
npm run dev                   # http://localhost:3000
```

The seed is idempotent (stable ids, upserts) and never deletes swipes or profiles, so re-running it is safe.
`npm run db:reset` is the only command that wipes data (dev use).

## Testing

```bash
npm run typecheck
npm run build
npm run db:reset && npm run dev   # then, in another terminal:
npm run test:api                  # walks the PRD acceptance criteria against the live API
```

## Deployment

```bash
npm ci && npm run build
npm run start:prod                # prisma migrate deploy && next start
```

Set `DATABASE_URL` (e.g. `file:/data/coy.db`) and run `npm run db:seed` once on first deploy.
SQLite needs a **persistent disk/volume**: on ephemeral filesystems (Vercel, most serverless/PaaS defaults) swipes and matches are lost on redeploy. Mount a volume (Fly.io, Railway, Render disk, VPS) or switch the Prisma provider to Postgres.

## API

| Method | Path | Success | Errors |
|---|---|---|---|
| GET | `/api/feed` | `200` array of public profiles not yet swiped (empty array is valid) | `500` |
| POST | `/api/swipe` | `200` `{ "match": true, "profile": {...} }` or `{ "match": false }` | `400` bad body, `404` unknown profile, `409` already swiped |
| GET | `/api/matches` | `200` array of mutual matches (empty array if none) | `500` |

Swipe request body: `{ "profileId": "<id>", "direction": "LIKE" | "PASS" }`.
All errors use the shape `{ "error": "message" }`. Responses are sent with `Cache-Control: no-store`.

```bash
curl localhost:3000/api/feed
curl -X POST localhost:3000/api/swipe -H 'Content-Type: application/json' \
     -d '{"profileId":"<id>","direction":"LIKE"}'
curl localhost:3000/api/matches
```

A public profile is exactly: `id, name, age, photo, bio, location, interests`.

## How the rules are enforced

- **One swipe per profile, ever:** `Swipe.profileId` is `@unique`. The service inserts and maps the database's unique-violation (`P2002`) to a `409`, so double-taps and concurrent requests are safe. This is not just a pre-check.
- **Matches are derived, not stored:** `match = direction == LIKE && profile.hasLikedUser`. There is no `Match` table to drift out of sync. `GET /api/matches` runs the same rule as a query.
- **Privacy boundary:** `src/lib/toPublicProfile.ts` is the only function that turns a `Profile` row into response JSON. It builds the output from an allow-list, so `hasLikedUser` (or any column added later) cannot leak. Feed and matches queries also `select` only the public columns, so the flag is never loaded for those routes.
- **Passing never matches**, and a like on a profile that has not liked you looks identical to a pass (`{ "match": false }`).

## Layout

```
prisma/
  schema.prisma          Profile + Swipe models
  seed.ts                31 profiles, 11 flagged hasLikedUser
src/
  app/api/feed|swipe|matches/route.ts    thin route handlers
  lib/discovery.ts       business logic: getFeed, recordSwipe, getMatches
  lib/toPublicProfile.ts the single serialization boundary
  lib/validation.ts      Zod schema for the swipe body
  lib/http.ts            HttpError + handle() for uniform error responses
  lib/interests.ts       JSON encode/decode for the interests column
  lib/prisma.ts          client singleton
  types/profile.ts       shared API types
scripts/api-check.ts     acceptance-criteria check against a running server
```

## Notes

- Home is intentionally blank. Frontend lives in `src/components` and `src/lib/useSwipeDeck.ts`.
- Prisma 6.19 prints a deprecation warning for the `"prisma"` key in `package.json` (seed config). It is harmless; it can move to a `prisma.config.ts` when upgrading to Prisma 7.
