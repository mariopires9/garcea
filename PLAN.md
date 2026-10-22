# Associação GARCEA — Website Project Plan

## Overview

Public website for Associação GARCEA, to be hosted at **associacaogarcea.pt**. All
content (Home, Gallery, Events, Contacts) is viewable by anyone without logging in.
Login is only required to add/manage content and to manage admin accounts. There is a
single permission level: any logged-in user is an admin with full access.

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router, TypeScript) | Handles both frontend pages and the BFF API routes |
| UI | Material UI (MUI) v9 | Replaced the default Tailwind scaffold; theme-level `LinkComponent`/`MuiLink` wired to Next.js `Link` (see `src/theme.ts`, `src/components/LinkBehavior.tsx`) so pages can pass a plain `href` string without crossing the Server/Client Component boundary with a function reference |
| BFF / API | GraphQL Yoga (or Apollo Server) mounted at `/app/api/graphql` | Single GraphQL endpoint; all DB access happens only here, server-side |
| Database | PostgreSQL via Supabase (free tier) | Persistent, free, direct SQL access (dashboard + connection string) |
| ORM | Prisma | Type-safe schema/migrations, used only inside GraphQL resolvers |
| Auth | Auth.js (`next-auth@5`) + Credentials provider, JWT sessions | App Router-native (route handlers + `auth()` helper); no Prisma Adapter needed since Credentials + JWT reads/writes `User` directly via Prisma |
| File storage | Supabase Storage (free tier bucket) | Free image hosting for gallery photos |
| Video hosting | YouTube/Vimeo (unlisted), embed link stored in DB | Avoids Supabase's free-tier storage/bandwidth limits, which video files would blow through |
| Hosting | Vercel (free tier) for the Next.js app | Deploys cleanly; DB/storage stay on Supabase regardless of where the app runs |
| Domain | `associacaogarcea.pt` pointed at Vercel via DNS | Custom domain for the public site, configured once deployed |

## Architecture (BFF pattern)

```
Browser -> Next.js pages/components -> Apollo/urql client
              | (only via GraphQL)
       /app/api/graphql (BFF: Yoga/Apollo Server)
              |
        GraphQL resolvers -> Prisma Client -> Supabase Postgres
                                            -> Supabase Storage (photos)
```

Prisma is never imported into client components — resolvers are the only code touching
the database. Auth.js session is read server-side and passed into the GraphQL context so
resolvers can check whether a mutation is allowed (read = public, write = requires a
session).

## Data Model (Prisma sketch)

- **User** — id, name, email, passwordHash, createdAt
  (no role/permission fields — any authenticated user has full admin rights)
- **Event** — id, title, description, date, location, posterUrl (nullable,
  "Cartaz" - an optional poster image in Supabase Storage), createdById, createdAt
- **GalleryItem** — id, eventId (FK -> Event), type (`photo` | `video`), url,
  thumbnailUrl (nullable), caption, uploadedById, createdAt
  - `photo`: `url` points to a file in Supabase Storage
  - `video`: `url` is a YouTube/Vimeo embed link (unlisted), no file stored
- **ContactMessage** — id, name, email, message, submittedAt
- **RanchoSection** — singleton row (fixed id `"rancho"`), description, updatedAt;
  backs the Home page's "Rancho Folclórico das Lavradeiras de Gondar" section
- **RanchoFeaturedPhoto** — id, galleryItemId (FK -> GalleryItem, unique), createdAt;
  a join table marking which existing GalleryItem rows are featured on the Home
  page, rather than a separate photo upload/storage path

## Menu Behavior

| Menu | View | Manage (requires login) |
|---|---|---|
| Home | Public — includes the Rancho Folclórico section (description + featured photos) | Edit description, feature/unfeature existing gallery photos, at `/manage/rancho` |
| Gallery | Public, browsable by event | Upload photo (Supabase Storage) or add video embed link; edit/delete |
| Events | Public | Create/edit/delete |
| Contacts | Public submission form | View submitted messages |
| Login | Public (the login form itself) | Access to all "manage" actions above, plus account management |

**Account management**: a logged-in user can edit any user's name/email/password, or
add/remove an admin account. No role assignment needed since all accounts have equal
permissions.

## Roadmap

1. **Setup** — scaffold Next.js + TypeScript, git init, create Supabase project (DB +
   Storage bucket), configure env vars
2. **Database & Auth** — Prisma schema (User/Event/GalleryItem/ContactMessage),
   migrations, seed script (initial admin account), Auth.js credentials login
3. **BFF/GraphQL layer** — GraphQL endpoint, resolvers, session-aware context
   (mutations require a session, queries are open)
4. **Core layout & pages** — public nav (Home/Gallery/Events/Contacts/Login), GARCEA
   home content, login page
5. **Events feature** — public list/detail, gated create/edit/delete
6. **Gallery feature** — public gallery grouped by event, gated photo upload + video
   embed link input, gated edit/delete
7. **Contacts feature** — public submission form, gated inbox view
8. **Account management** — edit own/other admin profile, add/remove admin accounts
9. **Polish & deploy** — styling/responsiveness, deploy app to Vercel, verify Supabase
   connection in production

## Free-Tier Constraints

The site runs on Vercel Hobby and the Supabase free plan. These limits
should drive design decisions:

| Limit | Value | Implication |
|---|---|---|
| Supabase Storage | ~1GB | Compress photos in the browser before upload (done: `src/lib/compress-image.ts`); keep videos on YouTube/Facebook |
| Supabase egress | ~5GB/month | Paginate/lazy-load the gallery instead of loading every photo |
| Supabase database | 500MB, pauses after ~1 week idle | Keep-warm ping on the home page |
| Vercel function request body | 4.5MB (ignores `bodySizeLimit`) | Large multi-photo uploads must be split into several requests |
| Vercel image optimization | Limited quota | Don't route gallery photos through `next/image`; Supabase image transforms are Pro-only |
| Vercel cron | Once per day max | Use an external free pinger if more frequent keep-warm runs are needed |
| Vercel Hobby terms | Non-commercial use only | Fine for the association; no selling or ads on the site |

Open backlog items are tracked in [TASKS.md](./TASKS.md) under
"Backlog: improvement ideas".

## Open Questions

- Is there a distinction wanted between the two admin-type accounts (e.g., a "primary"
  owner who can remove the other), or are all admin accounts fully equal?
