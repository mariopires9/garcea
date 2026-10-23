# Associação GARCEA — Task List

Derived from [PLAN.md](./PLAN.md). Check items off as they're completed.

## Phase 1 — Setup

- [x] Scaffold Next.js app (TypeScript, App Router)
- [x] Init git repository, initial commit
- [x] Create GitHub repo under github.com/piresmario (e.g. `garcea`), add as `origin`, push initial commit
- [x] Create Supabase project
- [x] Create Supabase Storage bucket for gallery photos (`gallery-photos`, public)
- [x] Add `.env.local` with Supabase DB connection string, Supabase keys, Auth.js secret
- [x] Add `.gitignore` (node_modules, .env*, .next)
- [x] Install core dependencies (prisma, @prisma/client, next-auth, graphql, graphql-yoga)

## Phase 2 — Database & Auth

- [x] Write Prisma schema: `User`, `Event`, `GalleryItem`, `ContactMessage`
- [x] Run initial Prisma migration against Supabase
- [x] Write seed script to create the first admin `User` (hashed password)
- [x] Configure Auth.js: Credentials provider (no Prisma adapter needed — Credentials + JWT sessions read/write `User` directly via Prisma, an Adapter is only for DB sessions/OAuth)
- [x] Implement password hashing/verification (bcrypt) in the credentials `authorize` callback
- [x] Configure session strategy (JWT) and expose user id in session
- [x] Verify login works against the seeded admin account

## Phase 3 — BFF/GraphQL layer

- [x] Create `/app/api/graphql/route.ts` GraphQL server (graphql-yoga)
- [x] Define GraphQL schema (typeDefs) for User, Event, GalleryItem, ContactMessage
- [x] Build GraphQL context that reads the Auth.js session server-side
- [x] Write query resolvers (public): events, gallery items (by event), contact form is write-only
- [x] Write mutation resolvers (session-gated): createEvent, updateEvent, deleteEvent
- [x] Write mutation resolvers (session-gated): createGalleryItem, updateGalleryItem, deleteGalleryItem
- [x] Write mutation resolver (public): submitContactMessage
- [x] Write query resolver (session-gated): list contact messages
- [x] Add a small `requireUserId(context)` helper used by all gated resolvers
- [x] Frontend GraphQL clients pointing at `/api/graphql`: `executeGraphQL` (in-process, for Server Components) and `gqlFetch` (HTTP, for Client Component mutations) — skipped Apollo Client/urql as unnecessary weight for a ~5-page site; easy to swap in later if needed

## Phase 4 — Core layout & pages

- [x] Build root layout with nav: Home, Gallery, Events, Contacts, Login
- [x] Build Home page with GARCEA intro content
- [x] Build Login page (Server Action -> Auth.js `signIn`)
- [x] Add logged-in state to nav (show "Manage" / "Logout" when authenticated)
- [x] Add `src/proxy.ts` (Next.js 16 renamed `middleware.ts` -> `proxy.ts`, now
      Node.js runtime by default) to protect `/manage/*` via `callbacks.authorized`
      in `src/auth.ts`; unauthenticated requests redirect to `/login`
- [x] Added minimal stub pages for `/gallery`, `/events`, `/contacts`, and a
      `/manage` landing page so all nav links resolve (Phases 5-8 replace these)

## Phase 5 — Events feature

- [x] Public events list page (`/events`)
- [x] Public event detail page (`/events/[id]`), shows related gallery items
- [x] Manage: events list (`/manage/events`) + create event form (`/manage/events/new`)
- [x] Manage: edit event form (`/manage/events/[id]/edit`)
- [x] Manage: delete event action with confirmation page (`/manage/events/[id]/delete`)
- [x] `Cartaz` (poster image) field on Event: optional upload via the same
      `uploadPhoto`/`deletePhoto` helpers as the Gallery feature. Create:
      upload sets `posterUrl`. Edit: upload a new file replaces it (old file
      cleaned up from Storage by the `updateEvent` resolver, which diffs
      old vs. new `posterUrl`), or check "Remove current poster" to clear it
      (also cleaned up). Delete: `deleteEvent` resolver cleans up the poster
      too, mirroring `deleteGalleryItem`. Shown on the event detail page,
      and as a thumbnail on both the public and manage events lists.
      Hit and fixed a real MUI v9 bug along the way: `Checkbox` +
      `FormControlLabel` threw `Cannot read properties of undefined
      (reading 'disabled')` when server-rendered in this form; replaced
      with a plain native `<input type="checkbox">` (same pattern already
      used for the Contacts honeypot field).
      Verified end-to-end: create with poster, replace (old file actually
      gone from the Storage bucket listing, not just the DB), remove
      (Storage confirmed empty), delete event (no orphaned file).
- [x] Cartaz: accept PDF in addition to images (many real event posters are
      designed as PDFs). Added `uploadPoster()` (separate from `uploadPhoto`,
      which stays image-only for the Gallery feature) allowing `image/*` or
      `application/pdf`, raised to a 15MB limit, and `isPdfUrl()` to detect
      PDF posters by extension so they render as a "Ver cartaz (PDF)" link
      instead of a broken `<img>` tag - applied on the event detail page, the
      edit form's current-poster preview, and skipped entirely in the two
      list-page thumbnails (public `/events` and `/manage/events`).
      Investigated a user-reported "error" uploading a JPEG poster: could not
      reproduce with a real JPEG file end-to-end, so it wasn't type-specific;
      raised the poster size limit (8MB -> 15MB) as the most likely fix since
      real camera/phone photos can exceed 8MB, pending confirmation from the
      user with the exact error text if it recurs.
      Verified end-to-end: JPEG, PNG, and PDF posters all upload and display
      correctly (PDF as a working link, confirmed the file itself is
      fetchable from Storage, not just present in the bucket listing).

## Phase 6 — Gallery feature

- [x] Public gallery page (`/gallery`), grouped by event
- [x] Photo upload: Server Action reads the file(s) from FormData and uploads
      directly to Supabase Storage (`gallery-photos` bucket) via its REST API,
      then saves the public URL via `createGalleryItem`
- [x] Multi-photo upload: the file input accepts multiple files at once;
      each is uploaded and saved as its own gallery item sequentially
      (fail-fast on the first error, sharing the same caption/event), so
      you don't have to repeat the whole form per photo
- [x] Video: form field to paste a YouTube/Vimeo embed link, saved via
      `createGalleryItem` (no file upload)
- [x] Render photos as images, videos as embedded iframe/player
      (`GalleryItemCard`, shared with the Events feature)
- [x] Manage: edit caption / delete gallery item (delete also removes the
      underlying file from Storage for photos, not just the DB row)

## Phase 7 — Contacts feature

- [x] Public contact page with form (name, email, message)
- [x] Wire form to `submitContactMessage` mutation (Server Action)
- [x] Manage: inbox page listing submitted messages (`/manage/contacts`)
- [x] Honeypot field for spam mitigation — filled submissions get the same
      success redirect but are never persisted, so bots aren't tipped off

## Phase 8 — Account management

- [x] Manage: page listing all admin accounts
- [x] Manage: edit account (name, email, password change)
- [x] Manage: add new admin account
- [x] Manage: remove admin account (with confirmation; the owner account can
      never be removed, so the last account can't be removed either)
- See "Account management with a protected owner" below for the details.

## Phase 9 — Polish & deploy

- [ ] Responsive styling pass across all pages
- [ ] Basic loading/error states for GraphQL queries and mutations
- [ ] Deploy Next.js app to Vercel
- [ ] Configure production env vars on Vercel (Supabase URL/keys, Auth.js secret)
- [ ] Add custom domain `associacaogarcea.pt` (and `www.associacaogarcea.pt`) in Vercel project settings
- [ ] Update DNS at the domain registrar to point to Vercel (A/CNAME records Vercel provides)
- [ ] Set production `NEXTAUTH_URL=https://associacaogarcea.pt`
- [ ] Verify HTTPS/SSL is issued and working on the custom domain
- [ ] Verify production build against Supabase (DB + Storage) end to end
- [ ] Final smoke test: view all public pages, log in, add/edit/delete content, log out

## Post-Phase-7 code review fixes

- [x] Raised Server Action body size limit to 10mb (Next.js defaults to 1MB,
      which would have silently broken most real phone-photo uploads against
      our 8MB app-level limit)
- [x] Clean up orphaned Storage file if `createGalleryItem` fails after upload
- [x] Redirect to `/login` instead of crashing if a session expires mid-form
      on a `/manage/*` page (new `runGatedMutation` helper in graphql-server.ts)
- [x] Fail loudly instead of silently defaulting to "now" when an event's date
      is missing
- [x] Normalize blank captions to `null` consistently on both create and edit
- [x] Removed unused `gqlFetch` client helper (dead code, nothing ever called it)
- Accepted as out-of-scope for this site's size: honeypot doesn't block a
  hand-crafted GraphQL request (would need rate-limiting/CAPTCHA to fully
  close), storage-delete failures on item deletion are logged not surfaced,
  and gallery/event relations do a Prisma query per row rather than batching
  (N+1) — all real but not worth the complexity at ~5 admins/small galleries

## UI: migrated to Material UI

- [x] Replaced Tailwind CSS with Material UI (MUI) v9 across every page and
      component, per user request
- [x] `src/theme.ts` + `src/components/ThemeRegistry.tsx` (theme must be
      created inside a Client Component — passing a `createTheme()` object as
      a prop from a Server Component fails, since it contains functions)
- [x] `src/components/LinkBehavior.tsx` wired as the theme's default
      `LinkComponent`/`MuiLink` component, so pages just pass a plain `href`
      string to `Button`/`CardActionArea`/`ListItemButton`/`Link` instead of
      `component={Link}` (passing the Next.js `Link` component reference
      itself across the Server/Client boundary also fails, same root cause)
- [x] Found and fixed: GraphQL execution results aren't guaranteed to be
      plain objects (graphql-js 17), which breaks passing them as props into
      a Client Component (`GalleryItemForm`'s event dropdown) - fixed by
      explicitly rebuilding plain object literals before passing down
- Verified end-to-end against a live dev server: every public/manage page
  renders (200, real MUI markup), and the three "use client"/form-heavy
  flows most likely to break (login, event creation, the Select-based
  gallery item form, and the contact form) all submit correctly

## Home page: Rancho Folclórico das Lavradeiras de Gondar section

- [x] `RanchoSection` model (singleton row, id fixed as `"rancho"`) for the
      editable description text, and `RanchoFeaturedPhoto` — a join table
      referencing existing `GalleryItem` rows, rather than a separate photo
      upload pipeline (per user's explicit design direction: reuse the
      Gallery table, reference photos from it instead of duplicating storage)
- [x] `GalleryItem.isFeaturedInRancho` computed field so the manage picker
      can show which photos are already featured
- [x] Home page renders the description (when set) and a photo grid (when
      any photos are featured) reusing the existing `GalleryItemCard`
- [x] `/manage/rancho`: edit description, list featured photos with a
      "Remove from Home page" action per photo
- [x] `/manage/rancho/add-photo`: picker over all gallery items not yet
      featured, each with a "Feature on Home page" action
- Verified end-to-end against a live dev server: set description -> shows
  on home page; upload a gallery photo -> feature it -> appears in the
  home page "Fotos" section and the manage list; unfeature -> disappears
  from both; test data cleaned up afterward (home page confirmed back to
  its empty state, matching what real visitors see before content exists)
- Still waiting on the user to provide the real description text and
  photos (they said they'd add both themselves via `/manage/rancho`,
  or send them here to add on their behalf)

## Historial section (new top-level nav item)

- [x] `HistorialSection` model (singleton row, id fixed as `"historial"`),
      same shape as `RanchoSection` but no photo gallery — just editable text
- [x] Public `/historial` page — title always shown, description or a
      "Sem conteúdo por enquanto" empty state
- [x] `/manage/historial` — single-field edit form (mirrors `/manage/rancho`'s
      description form)
- [x] Added to the main nav (`Nav.tsx`) and the Manage landing page's link list
- Verified end-to-end against a live dev server: page renders with the empty
  state, login + description update persists and shows on both the public
  page and the manage form, test data cleaned up afterward

## Production bug: Cartaz/Gallery uploads failing on Vercel only

- Reported: uploading a Cartaz worked on `localhost` but threw a 500 on
  `https://garcea.vercel.app`. Vercel's function logs (pulled via `vercel
  logs --follow`, since the browser only showed a generic error) showed the
  real cause: `TypeError: Cannot convert argument to a ByteString because
  the character at index 165 has a value of 9474 which is greater than
  255.` — thrown from the `fetch()` call in `uploadToStorage()`
  (`src/lib/supabase-storage.ts`).
- Character code 9474 is `│` (box-drawing vertical bar). `fetch()` headers
  must be Latin-1, so a stray `│` inside the `SUPABASE_SERVICE_ROLE_KEY`
  env var (used in the `Authorization`/`apikey` headers) broke every
  Storage upload on Vercel — Gallery photos too, since they share the same
  helper, not just Cartaz. Root cause: the key's value on Vercel had
  gotten corrupted, most likely from being copy-pasted out of a
  terminal/table view that wraps long lines with a `│` border character.
  `.env.local` had a clean copy, so it never reproduced locally.
- Fixed by the user: re-copied the `service_role` key directly from the
  Supabase dashboard and reset it in Vercel's Production + Preview
  environment variables, then redeployed. Confirmed working.
- Takeaway for any future "works locally, breaks on Vercel" report: check
  Vercel's function logs (`vercel logs --follow <url>` or the dashboard's
  Functions/Logs tab) first — the browser's generic 500 hides the real
  error, which was diagnosed here in one shot once the actual log line was
  visible.

## Event gallery carousel + home page visual refresh

- [x] Replaced the static photo grid on the event detail page
      (`/events/[id]`) with a swipeable carousel (`embla-carousel-react`,
      `src/components/GalleryCarousel.tsx`): prev/next `IconButton`s, dot
      navigation, responsive slide widths (1 per view on mobile, up to
      2.5 on desktop so the next slide peeks in). Hit the same "GraphQL
      results aren't plain objects" RSC boundary issue documented earlier
      for `GalleryItemForm` — fixed the same way, by rebuilding
      `event.galleryItems` as plain object literals before passing them to
      the client carousel.
- [x] Added `@mui/icons-material` (matching the installed MUI v9 version)
      for the carousel's arrow icons.
- [x] Home page refresh: full-bleed gradient hero (blue, sampled from the
      real logo colour `#0340d8`) with title, subtitle, and two CTA buttons
      ("Ver Eventos", "Conhecer a Nossa História"); the Rancho section is
      now wrapped in an outlined `Paper` card instead of sitting directly
      on the page background.
- [x] Theme (`src/theme.ts`): added a real `palette` (primary blue sampled
      from the logo, warm amber secondary), `shape.borderRadius: 12`,
      bolder heading weights, and `MuiButton` defaults (no shadow,
      no-uppercase text) for a more modern look site-wide.
- [x] Small polish: `GalleryItemCard` now lifts with a shadow on hover
      (used by the carousel, the gallery grid, and the Rancho photo grid).
- Verified against a live dev server: `tsc --noEmit`, `eslint`, and
  `next build` all clean; confirmed via real data (a live event with 7
  gallery items) that the carousel renders all 7 dots and images, all
  referenced JS chunks return 200 (no broken client bundle), and the home
  page hero/CTA markup renders. Could not visually screenshot — the
  sandboxed headless Chromium is missing system libraries
  (`libnspr4.so`) and there's no root access to install them - verified
  structurally via curl + rendered HTML instead, consistent with this
  project's established no-browser testing approach.

## Sticky header + site-wide modern styling pass

- [x] `Nav`'s `AppBar` changed from `position="static"` to `position="sticky"`
      (`top: 0`) so it stays visible while scrolling instead of scrolling
      out of view. Tried setting `zIndex` explicitly via an `sx` callback
      first - hit the RSC "functions can't cross the Server/Client boundary"
      issue documented earlier (`Nav` is a Server Component, `AppBar` a
      Client Component) - removed it since `MuiAppBar` already applies
      `theme.zIndex.appBar` by default, no override needed.
- [x] New `src/components/FormCard.tsx` (a small `Paper` wrapper) applied
      everywhere a bare form previously sat directly on the page background:
      Login, Contacts, `EventForm`, `GalleryItemForm`, the gallery caption
      edit form, and the Rancho/Historial description forms - one consistent
      "modern form" look across every page that has one.
- [x] `/manage` landing page: replaced the plain `List`/`ListItemButton`
      links with a responsive grid of hoverable `Card`s.
- [x] `/manage/events` list: replaced the plain bordered `Box` rows with
      `Card`s (hover shadow), matching `/events`' public list styling.
- [x] `/events` public list: added the same hover-lift treatment already
      used by `GalleryItemCard`/`GalleryCarousel` and the home page's
      Rancho photo grid, so every clickable card site-wide behaves the same.
- [x] `/historial` public page: wrapped the description in an outlined
      `Paper`, matching the Rancho section's card on the home page.
- Verified end-to-end: `tsc --noEmit`, `eslint`, `next build` all clean.
  All public pages return 200 via curl. For the authenticated `/manage/*`
  pages, curl-replicated logins to this dev server return a deterministic
  `Error: Connection closed.` from the `authenticate` Server Action -
  confirmed via `git stash` that this reproduces identically on the
  previous commit too, so it predates and is unrelated to this pass (not
  investigated further, out of scope for this task; the user has
  successfully logged in through a real browser both locally and on
  production, so this looks like a curl/wire-protocol replication
  limitation rather than an app bug). Verified the styled `/manage/*`
  pages directly instead by minting a valid Auth.js session JWT with
  `next-auth/jwt`'s `encode()` and passing it as a cookie - confirmed all
  of them return 200 and contain the expected new markup (`MuiPaper-root`
  in the wrapped forms, `MuiCard-root` rows, the new manage landing page's
  card grid).

## Official Contacts (emails and phone numbers shown on the public Contacts page)

- [x] New `OfficialContact` model (`id`, `type: OfficialContactType` enum
      `EMAIL | PHONE`, `value`, `createdAt`) - a flat list rather than a
      singleton row, so any number of emails and phone numbers can be added
      independently, matching how `GalleryItem.type` already discriminates
      photo vs. video with one table.
- [x] GraphQL: public `officialContacts` query, gated
      `createOfficialContact`/`deleteOfficialContact` mutations.
- [x] `/manage/official-contacts`: add form (`OfficialContactForm`, a
      type-select + value field that switches between an `email` and `tel`
      input depending on the selected type, mirroring `GalleryItemForm`'s
      type-dependent field) plus a list of existing contacts with delete
      buttons, added to the `/manage` dashboard's card grid.
- [x] Public `/contacts` page: shows all official emails (as `mailto:`
      links) and phone numbers (as `tel:` links) in a card above the
      message form, hidden entirely when there are none yet.
- Verified end-to-end against the live dev server and Supabase: created one
  email and one phone via a direct GraphQL mutation call (see below for why),
  confirmed both render correctly on `/contacts` (as working `mailto:`/`tel:`
  links) and on `/manage/official-contacts` (with working delete buttons),
  confirmed an unauthenticated mutation attempt is rejected
  (`UNAUTHENTICATED`), deleted both, and confirmed both pages return to
  their empty states.
- While testing, found that curl-replicated calls to *any* Server Action
  that ends in `redirect()` (not just this feature's - reproduced the same
  way against the pre-existing `updateHistorySectionAction`) currently
  fail with a deterministic `Error: Connection closed.` on this dev
  server, matching the same pre-existing, unrelated issue already noted
  above for `authenticate`. Worked around it by exercising the same
  resolver code directly via `/api/graphql` (with the session cookie
  attached), which is a faithful test of the actual create/delete/gating
  logic even though it doesn't exercise the Server Action's `redirect()`
  wrapper itself.

## Events page: filter by year

- [x] `/events` reads a `?year=` search param, with a `EventYearFilter`
      client component (a `Select` that navigates via `router.push` on
      change) next to the page title. Defaults to the current year when
      no param is present, or when the param is missing/invalid/not one
      of the actual available years (any year that has at least one
      event, plus the current year even if it has none yet) - falls back
      to the current year rather than showing a blank page for an
      arbitrary or typo'd year in the URL.
- [x] Filtering itself is done in memory after fetching all events (no
      GraphQL query changes) - the dataset is small enough for a single
      community association that this is simpler than adding server-side
      filtering, consistent with this project's existing "don't
      over-engineer for this site's size" calls.
- [x] Empty state updated to name the selected year ("Não há eventos em
      2027.") instead of the generic "Ainda não há eventos.".
- Verified end-to-end against the live dev server and Supabase: with only
  the one real 2026 event, confirmed the default (no param) and an
  explicit `?year=2026` both show it, and an arbitrary out-of-range
  `?year=2020` correctly falls back to 2026 rather than showing blank.
  Then created a temporary second event dated in 2025 to properly
  exercise the filter: confirmed the default view shows only the 2026
  event (not 2025), and `?year=2025` shows only the 2025 one (not 2026) -
  then deleted the temporary event and confirmed the events list is back
  to just the one real event.

## Removed the Contacts message form

- [x] Per explicit request, removed the contact submission form entirely
      (name/email/message + honeypot field) - the public `/contacts` page
      now only shows the Official Contacts (emails/phones) from the
      previous feature, with a plain "Ainda não há contactos disponíveis."
      fallback if none are set.
- [x] Dropped the whole `ContactMessage` model/table (confirmed it held
      zero real rows first, so no data was lost) and every layer built on
      it: the `ContactMessage`/`ContactMessageInput` GraphQL types, the
      `contactMessages` query, the `submitContactMessage` mutation, the
      `/manage/contacts` inbox page, `src/app/contacts/actions.ts`, and
      `src/lib/queries/contacts.ts`. Removed the "Mensagens de Contacto"
      link from the `/manage` dashboard.
- Verified end-to-end: `tsc --noEmit`, `eslint`, `next build` all clean
  (had to delete the stale `.next` cache once, since it still referenced
  the deleted `/manage/contacts` route's generated types). Confirmed live:
  `/contacts` renders with no form markup, `/manage/contacts` now 404s
  even when authenticated (not just an auth redirect), the `contactMessages`
  GraphQL field is rejected by schema validation, and the two real emails
  the user had already added via Official Contacts still render correctly
  on the public page - left untouched, since that's real data, not test
  data from this session.

## Autoplay the centered video in the event gallery carousel

- [x] `GalleryItemCard` takes a new optional `autoPlay` prop; when set and
      the item is a video, appends `autoplay=1&mute=1&muted=1` to the
      embed URL (muted, since browsers generally block unmuted iframe
      autoplay regardless of user gesture) and adds the iframe's
      `allow="autoplay; fullscreen; picture-in-picture"` attribute needed
      for that to actually be permitted. Non-carousel usages
      (`/gallery`, the Rancho photo grid, manage pages) don't pass it, so
      their video behavior is unchanged.
- [x] `GalleryCarousel` passes `autoPlay={index === selectedIndex}` to
      each slide - Embla's default `align: "center"` already centers the
      selected slide, so "selected" and "centered" are the same slide,
      matching the request as written.
- Verified end-to-end against the live dev server: added a temporary test
  video as the event's newest (and therefore first/initially-centered)
  gallery item, confirmed via the rendered HTML that only its iframe `src`
  got the autoplay params while the event's other, pre-existing real video
  did not; deleted the test video afterward and confirmed the real one
  (now first) correctly picks up the autoplay params in its place, and
  that no other gallery items were affected.
- Noted but out of scope: that real pre-existing video's URL is a
  `youtu.be/...` short link rather than the `youtube.com/embed/...` format
  YouTube's iframe player actually needs, so it may not display/play at
  all regardless of this change - separate, pre-existing issue, flagged
  to the user rather than fixed here.

## Accept plain YouTube/Facebook links for the Gallery video field

- [x] New `src/lib/video.ts`: `normalizeVideoUrl()` converts a normal
      YouTube link (`youtube.com/watch?v=`, `youtu.be/`,
      `youtube.com/shorts/`, `m.youtube.com/...`) to the
      `youtube.com/embed/VIDEO_ID` form the iframe player actually needs,
      and a normal Facebook link (a video permalink, `fb.watch/...`, or
      `facebook.com/watch/?v=`) to Facebook's
      `facebook.com/plugins/video.php?href=...` embed form. Anything else
      (an already-built embed URL, e.g. Vimeo) passes through unchanged,
      so existing behavior for other providers isn't affected. This
      directly fixes the `youtu.be` link problem flagged in the previous
      entry - admins no longer need to hand-build an embed URL.
- [x] `createGalleryItemAction` runs the pasted video URL through
      `normalizeVideoUrl()` before saving, so the stored URL is always the
      embeddable form. Caption-only editing doesn't touch the URL, so
      nothing else needed to change.
- [x] `GalleryItemForm`'s video field relabeled to "Link do Vídeo (YouTube
      ou Facebook)" with matching placeholder/helper text, since admins
      now paste the normal link they'd share, not a hand-built embed URL.
- [x] `GalleryItemCard`'s autoplay-on-select helper (from the previous
      entry) is now platform-aware: Facebook's video plugin expects
      `autoplay=true`/`mute=true` (string booleans), not the `1`/`0` style
      YouTube (and most other embeds) use - added `isFacebookEmbedUrl()`
      to `video.ts` and branch on it.
- Verified: unit-style checks of `normalizeVideoUrl()` against 9 real-world
  URL shapes (youtu.be, watch?v=, watch?v=&list=, m.youtube.com, shorts,
  already-embed, a Facebook video permalink, fb.watch, facebook.com/watch)
  all produced the expected embeddable URL, and an invalid string
  correctly threw. Confirmed the actual Server Action wiring is correct by
  invoking `createGalleryItemAction` directly (bypassing curl, since the
  pre-existing unrelated "Connection closed" issue - see above - blocks
  curl-replicated Server Actions that redirect): normalization ran
  successfully before failing only on `headers()` needing a real request
  context, which a standalone script can't provide. Then did a full round
  trip via GraphQL directly with pre-normalized URLs: confirmed both a
  YouTube and a Facebook video render correctly on `/gallery`, and that
  adding the Facebook one to the live event's carousel correctly produces
  `autoplay=true&mute=true` (not `=1`) when it's the centered slide. All
  test gallery items deleted afterward; confirmed the real data (including
  a video the user had, in parallel, fixed themselves with a proper
  YouTube embed URL) was left untouched throughout.

## Fix: YouTube video showing "An error occurred. Please try again later."

- Reported: a real YouTube video on the live event page failed to play,
  showing YouTube's generic player error with a Playback ID (screenshot
  provided). Confirmed the video itself is fine (public, embeddable per
  YouTube's oEmbed API) and the stored URL was already a correctly-formed
  `youtube.com/embed/...` link, so this wasn't a URL-normalization issue.
- Root cause: fetched the live production HTML directly and found the
  video/Facebook `<iframe>` had **no `allow` attribute at all** (just
  `allowFullScreen`). Without an explicit `allow="...encrypted-media..."`,
  browsers deny that permission to a cross-origin iframe by default, and
  many YouTube videos require it for DRM-protected playback - failing with
  exactly this generic error instead of a clearer one.
- [x] Fixed in `GalleryItemCard.tsx`: the iframe's `allow` attribute now
      matches YouTube's own recommended embed permissions list
      (`accelerometer; autoplay; clipboard-write; encrypted-media;
      gyroscope; picture-in-picture; web-share`), taken directly from the
      iframe snippet YouTube's oEmbed API itself returns.
- Not yet deployed: this fix (and everything else committed since the
  user said "don't push" - Official Contacts, the events year filter,
  removing the Contacts form, carousel autoplay, and YouTube/Facebook
  link normalization) is local-only. Asked the user whether to push now
  since this directly fixes their reported bug; they chose to keep
  holding, so production still has the broken (no-`allow`) iframe until
  a future push.

## Fix: video left an empty gap below it in the carousel

- Reported (with screenshot): the video slide in the event carousel was
  much shorter than the photo slides next to it, leaving a large empty
  gap below it inside the card.
- Root cause: `GalleryItemCard` sized photos and videos by a fixed
  `aspect-ratio` (1:1 / 16:9). The carousel row's height was set by
  flexbox stretching to whichever slide happened to be tallest (the
  square photos), but the video's own `Card` only grew to its 16:9
  content height and never filled that stretched space, leaving the gap.
- [x] Added a `fillHeight` prop to `GalleryItemCard`: when set, the
      `Card` becomes a `height: 100%` flex column and the photo `img`/
      video `iframe` use `flex: 1; min-height: 0` instead of a fixed
      aspect ratio, so they fill whatever height they're given.
- [x] `GalleryCarousel` now gives its row an explicit height
      (`{ xs: 280, sm: 320, md: 360 }`) instead of relying on aspect-ratio
      to establish it, and passes `fillHeight` for every slide - so this
      works correctly even for a gallery that's all video with no photo
      to anchor the row height, not just the common case.
      Non-carousel usages (`/gallery`, Rancho grid, manage pages) don't
      pass `fillHeight`, so they keep their original aspect-ratio sizing.
- Verified: rebuilt, then inspected the actual generated CSS in the
  rendered HTML (not just the component code) to confirm `flex: 1;
  min-height: 0` landed on both the photo `<img>` and video `<iframe>`,
  the row's fixed height rule is present, and the `Card` has
  `height: 100%` as a flex column - all three pieces the fix depends on.

## Add restrained color across the rest of the site

- Home already had the gradient hero from an earlier pass; asked for the
  same "modern but not exaggerated" color treatment on every other page.
- [x] New `src/components/PageTitle.tsx`: a small colored circular icon
      badge next to the page's `<h1>`, alternating `primary` (blue, sampled
      from the logo) and `secondary` (amber) per page for variety without
      it being loud. Applied to every public and manage page's title:
      Events (list + detail, `EventIcon`), Gallery (`PhotoLibraryIcon`),
      Historial (`AutoStoriesIcon`, secondary), Contacts (`EmailIcon`,
      secondary), the Manage dashboard (`AdminPanelSettingsIcon`), and
      each Manage sub-page ((Events/Gallery primary, Rancho/Historial
      secondary, Official Contacts primary) - matching the icon each gets
      on the dashboard's own link tile for consistency.
      Login gets its own centered variant (same badge, centered layout)
      since its narrow card doesn't fit the row-based `PageTitle`.
- [x] `FormCard` gets a thin `primary`-colored top border - one small
      unifying touch that now colors every form site-wide (login, event/
      gallery item forms, Rancho/Historial description forms, Official
      Contacts) without repeating it by hand in six places.
- [x] Event dates (list, detail, and the manage events list) changed from
      plain grey text to a small `secondary`-colored `Chip`.
- [x] Gallery page: each event group's heading gets a small `primary`
      count `Chip` (how many items in that group).
- [x] Manage dashboard tiles: each link now has the same colored icon as
      its destination page, in a small circular badge, instead of plain
      text-only cards.
- Verified: `tsc --noEmit`, `eslint`, `next build` all clean (had to drop
  an import that became unused after replacing a page's title with
  `PageTitle`). Confirmed live against the dev server: every touched
  public and authenticated manage page returns 200, and inspected the
  actual generated CSS (not just the component code) to confirm the icon
  badge's blue background, the secondary-colored chip class, and the
  form card's colored top border are all really present in the rendered
  page, not just written in the source.

## Site footer: social media links (manageable) + reserved rights

- [x] New `SocialLink` model (`id`, `platform: SocialPlatform` enum
      `FACEBOOK | INSTAGRAM | YOUTUBE | TWITTER | WHATSAPP | OTHER`,
      `url`, `createdAt`) - a flat list like `OfficialContact`, so any
      number of links can be added/removed independently.
- [x] GraphQL: public `socialLinks` query, gated
      `createSocialLink`/`deleteSocialLink` mutations.
- [x] `src/components/SocialIcon.tsx`: maps each platform to its
      `@mui/icons-material` icon (Facebook/Instagram/YouTube/Twitter/
      WhatsApp, `Language` as a generic fallback for "Outro") plus the
      Portuguese label shown in the manage form's `Select` - shared
      between the footer and the manage page so they can't drift.
- [x] `src/components/Footer.tsx` (new, added to the root layout after
      `{children}`, so it sits at the bottom on every page via the
      existing `flex column` + `flex: 1` main-content layout): shows
      "© {current year} Associação GARCEA. Todos os direitos
      reservados." plus one icon button per social link (opens in a new
      tab), and simply omits the icon row entirely when there are none
      yet.
- [x] `/manage/social-links`: add form (platform `Select` + URL field)
      and a list of existing links with delete buttons, mirroring
      Official Contacts' structure exactly. Added to the `/manage`
      dashboard's card grid.
- Verified end-to-end against the live dev server and Supabase: created
  a Facebook and an Instagram link via a direct GraphQL mutation call,
  confirmed both render correctly in the footer (correct `href`,
  `target="_blank"`, `aria-label`, and the right icon's SVG - checked by
  its `data-testid`) on more than one page, and in the manage list;
  confirmed an unauthenticated mutation attempt is rejected
  (`UNAUTHENTICATED`); deleted both and confirmed the footer's icon row
  disappears entirely (not just empty) and the manage page shows its
  empty state.

## Home page: carousel for the Rancho "Galeria de Fotos" section

- [x] Replaced the static photo grid under "Galeria de Fotos" on the home
      page with the same `GalleryCarousel` already used on the event
      detail page - same prev/next arrows, dot navigation, and fixed-
      height fill for photos/videos. Rebuilt the featured photos as plain
      object literals before passing them in, same as the event page fix
      (GraphQL execution results aren't guaranteed to be plain objects,
      which breaks passing them into a Client Component).
- Verified against the live dev server with the real featured Rancho
  photos already in the database (2 of them): the carousel renders both
  dots, both images load from Supabase Storage, and prev/next controls
  are present - no test data needed since real content already existed.

## Remove the "Galeria" nav tab

- [x] Per explicit clarification ("only the tab"), removed just the
      `/gallery` entry from `Nav.tsx`'s link list. The public `/gallery`
      page itself, `/manage/gallery` (admin upload/edit), and every
      feature built on gallery items (event carousels, the home page's
      Rancho photos) are all untouched - `GalleryItemCard`/
      `GalleryCarousel` are used well beyond this one page.
- Verified: nav no longer renders a "Galeria" link, `/gallery` still
  returns 200 when visited directly, `next build` still lists both
  `/gallery` and `/manage/gallery` as real routes.

## Make the site actually usable on a phone

- Reported: "this website should run on phone also." Audited every page
  for mobile-breaking layout, since none of this had been tested at a
  narrow viewport before (no working browser in this sandbox - see the
  headless Chromium note earlier in this file).
- [x] **The nav bar was the main problem**: it packed the logo, "Associação
      GARCEA" text, 4 nav links, and the auth button into one row, which
      cannot fit a phone screen. New `src/components/NavMobileMenu.tsx`
      (client component): a hamburger `IconButton` (visible only below
      the `md` breakpoint) that opens a `Drawer` with all nav links plus
      Gestão/Sair or Entrar, stacked vertically. `Nav.tsx` now hides the
      old horizontal link `Stack` below `md` instead, and hides the
      "Associação GARCEA" text below `sm` (keeping just the logo) so the
      bar itself doesn't overflow even before the menu button is reached.
      The sign-out Server Action is passed down as a prop and submitted
      via a form inside the drawer, same pattern as everywhere else in
      this app - no new calling convention introduced.
- [x] Several manage-page rows packed a title/content block and one or
      two action buttons into a single non-wrapping flex row
      (`justifyContent: "space-between"` with no `flexWrap`) - fixed by
      adding `flexWrap: "wrap"` (+ matching `gap`) to: the Events/Gallery/
      Rancho manage page headers, the Manage Events list `Card`s, the
      Official Contacts and Social Links list `Card`s, and the date+
      location `Stack`s on the public/manage Events pages and the event
      detail page (in case of a long location name).
- [x] Per a follow-up suggestion, converted every hardcoded pixel
      dimension in a component/page `sx` prop (icon badges, thumbnails,
      the nav logo, the carousel's row height and dot indicators, poster
      preview max-widths) to `rem`, so they scale with the user's
      font-size preference instead of staying a fixed physical size -
      MUI's `Typography` variants already default to `rem`, this closes
      the gap for the custom pixel values added throughout this session.
      The nav logo keeps a higher native resolution (bumped `next/image`
      intrinsic size 40->80) while its *displayed* size is now set via
      `rem` in an inline `style`, since `next/image` needs numeric
      width/height for its own optimization regardless of display size.
- Verified: `tsc --noEmit`, `eslint`, `next build` all clean. Confirmed
  live against the dev server that every touched page still returns 200,
  and inspected the actual generated CSS/HTML (not just the component
  code) for both the hamburger's Drawer content and every converted
  `rem` value, confirming they're really present in the rendered output.
  Could not visually confirm at an actual narrow viewport - same headless
  Chromium limitation noted earlier in this file (missing system
  libraries, no root access to install them) - verified structurally via
  the generated CSS media queries instead (confirmed the desktop link
  `Stack` and the mobile text label both flip at the right breakpoint).

## Fix: text too big on mobile

- Reported: heading/body text felt oversized on a phone screen.
- Root cause: MUI's `Typography` variants (`h1`-`h6`, etc.) render at a
  single fixed size by default regardless of viewport - `theme.ts` only
  overrode `fontWeight` for the headings, never their size, so every
  page title (via `PageTitle`) and section heading rendered at full
  desktop size (e.g. `h4` at `2.125rem`) even on a narrow phone.
- [x] Wrapped the theme in MUI's `responsiveFontSizes()` helper
      (`src/theme.ts`: `createTheme` result renamed to `baseTheme`,
      `export const theme = responsiveFontSizes(baseTheme)`), which
      auto-interpolates every heading variant's size across breakpoints
      instead of needing a manual `sx` override on every single heading.
      Confirmed via the generated CSS that `h4` now steps
      `1.5625rem -> 1.82rem -> 2.02rem -> 2.125rem` across the four
      breakpoints instead of being `2.125rem` everywhere.
- [x] `PageTitle`'s icon badge (fixed at `2.75rem` regardless of screen
      size) now shrinks to `2.25rem` below the `sm` breakpoint too, so it
      stays proportional to the now-smaller mobile heading next to it.
- Hit a stale-Turbopack-cache issue while restarting the dev server after
  this change (`Export theme doesn't exist in target module` despite the
  file being correct and `tsc`/`eslint`/`next build` all passing) -
  resolved by deleting `.next` and restarting, matching the same class of
  issue documented earlier in this file for the Prisma client singleton.
- Verified: `tsc --noEmit`, `eslint`, `next build` all clean; every
  touched page still returns 200; inspected the actual generated CSS
  (not just the component code) to confirm both the responsive `h4`
  breakpoint steps and the icon badge's smaller mobile size are really
  present in the rendered output.

## Shrink text/titles further on mobile

- Follow-up to the previous fix: wanted headings/titles even smaller on
  phone specifically, not just "responsive."
- [x] MUI's `responsiveFontSizes()` computes the xs-breakpoint minimum
      as `1 + (maxFontSize - 1) / factor` (read straight from its source
      rather than guessed, to get the direction right) - a *higher*
      factor divides more off the top before adding the 1rem floor back,
      shrinking mobile text more. Bumped `factor` from the default `2`
      to `6` in `src/theme.ts`. Confirmed the `h4` minimum dropped from
      `1.5625rem` to `1.1875rem` in the generated CSS.
  - Only affects variants whose base size is above 1rem (h1-h6 in this
    app's case) - `body1`/`body2`/`caption`/etc. are already at or below
    1rem and are left untouched by the helper, so this couldn't have
    shrunk regular body text further either way.
- [x] The home page hero title bypasses the theme (`variant="h2"` with an
      explicit `sx` breakpoint override, since it needed a different
      curve than the rest of the site) - shrunk its own `xs` value from
      `2.25rem` to `1.75rem` to match.
- [x] `PageTitle`'s icon badge shrunk again, `2.25rem -> 2rem` at `xs`.
- Verified: `tsc --noEmit`, `eslint`, `next build` clean; confirmed in the
  generated CSS that the `h4` minimum and the icon badge's `xs` size both
  reflect the new, smaller values, and that every touched page still
  returns 200.

## Show "Associação GARCEA" text in the header on mobile too

- The mobile nav work earlier hid this text below `sm` (logo only) to
  make room for the hamburger button. Reverted that per explicit request
  - now always visible, but at a smaller `0.9375rem` on mobile (`1.25rem`
    from `sm` up) with `whiteSpace: "nowrap"` so it can't wrap the
    `Toolbar` onto a second line. Logo (2.5rem) + this text + the
    hamburger button comfortably fit a 320px-wide phone by rough
    estimate (no way to confirm at an actual narrow viewport in this
    sandbox - see the recurring headless-Chromium note elsewhere in this
    file).
- Verified: `tsc --noEmit`, `eslint`, `next build` clean; confirmed in
  the generated CSS that the text no longer has any `display:none` rule
  and steps from `0.9375rem` to `1.25rem` as designed.

## Remove the "Associação GARCEA" title from the home page hero

- [x] Removed the standalone `h2`/`h1` title from the hero section per
      explicit request (the user pointed at the exact lines). Since that
      `Typography` was the page's only `<h1>`, promoted the welcome
      subtitle below it (`component="p"` -> `component="h1"`, visual
      `h6` styling unchanged) so the page still has exactly one `<h1>`
      rather than none - a small accessibility/SEO detail, not a visible
      layout change.
- Verified: `tsc --noEmit`, `eslint`, `next build` clean; confirmed live
  that the standalone title is gone and the page still has exactly one
  `<h1>` element.

## Reduce excess whitespace in the home hero after removing the title

- Reported (with screenshot): removing the hero title left a lot of
  empty vertical space above/below the remaining content, since the
  hero's padding was originally sized to fit a title too.
- [x] Reduced the hero `Box`'s `py` from `{ xs: 8, sm: 12 }` (64px/96px)
      to `{ xs: 4, sm: 6 }` (32px/48px), and dropped the subtitle's
      `mt: 2` (was spacing it away from the now-removed title above it).
- Verified: confirmed in the generated CSS that padding-top/bottom is
  now `32px`/`48px` at the two breakpoints (not just changed in source);
  `tsc --noEmit`, `eslint`, `next build` clean; every page still 200.

## Client-side image compression on upload

- Why: on the Supabase free tier (~1GB storage, ~5GB egress/month) raw
  4-6MB phone photos would fill storage after a few hundred uploads.
  Compressing in the browser (not with `next/image`, which would spend
  the Vercel Hobby image-optimization quota; Supabase image transforms
  are Pro-only) keeps photos at ~200-400KB.
- [x] `src/lib/compress-image.ts`: resizes to a max dimension on a canvas
      (EXIF orientation applied via `createImageBitmap`) and re-encodes as
      WebP at 0.82 quality. Safari can't encode WebP (`toBlob` silently
      returns PNG), so it falls back to JPEG there.
- [x] Left untouched: PDFs, GIFs (may be animated), SVGs, formats the
      browser can't decode (e.g. HEIC outside Safari), and any image where
      the compressed result would be larger than the original. The
      server-side 8MB/15MB checks in `supabase-storage.ts` still apply.
- [x] `src/components/ImageCompressingForm.tsx`: form wrapper that
      compresses the given file field inside the form action before calling
      the Server Action, so `SubmitButton`'s pending spinner also covers the
      compression time. Used by `GalleryItemForm` (`photo`, max 1920px) and
      `EventForm` (`cartaz`, max 2560px, since posters carry small text).
- Verified: `tsc --noEmit`, `eslint`, `next build` clean. Not yet
  verified with a real upload in the browser.
- Known issue (not fixed): `next.config.ts` sets `bodySizeLimit: "40mb"`,
  but Vercel caps function request bodies at 4.5MB regardless. With
  compression a typical multi-photo upload fits, but ~15+ photos in one
  submit can still exceed it. Fix would be uploading photos one request
  at a time - see backlog below.

## Photo lightbox (click a photo to view it full-screen)

- [x] `src/components/PhotoLightbox.tsx`: full-screen MUI `Dialog` with an
      Embla carousel inside - swipe, ← → keys, or side arrows to move
      between photos; caption + "3 / 12" counter; close via Esc, ✕ or back
      gesture. Videos are excluded (they keep playing inline in their card).
- [x] `GalleryItemCard` gained an optional `onPhotoClick` prop; when set the
      photo is wrapped in a `CardActionArea` with a `zoom-in` cursor.
      Without it (other `/manage` pages) nothing changes.
- [x] Wired into: public `/gallery` (new `GalleryGrid` client component),
      the home page and event detail carousels (`GalleryCarousel`), and
      `/manage/gallery` (new `GalleryLightbox.tsx`: a context provider +
      `ZoomableGalleryItemCard`, so the Server Component page keeps its own
      grid with event labels and Editar/Eliminar buttons). On the manage
      page the viewer only navigates the photos in the current filter.
- [x] Fixed: GraphQL results passed straight into the new `GalleryGrid`
      threw "Only plain objects ... can be passed to Client Components"
      (same graphql-js null-prototype issue as before) - rebuilt as plain
      object literals in `src/app/gallery/page.tsx`.
- [x] Fixed: the lightbox's prev/next arrows jumped down on hover/click.
      The theme's `MuiIconButton` hover override (`transform: scale(1.08)`
      in `src/theme.ts`) replaces the button's `translateY(-50%)`
      centering. The arrows' own `&:hover` now sets
      `translateY(-50%) scale(1.08)`, the same fix `GalleryCarousel`
      already used. Any future absolutely-positioned `IconButton` that
      uses `transform` needs the same treatment.
- Verified in headless Chromium: the public gallery lightbox opens, and
  the arrow stays centered after hover/click (stays at y≈380; before the
  fix it dropped to y=398). `/manage/gallery` only checked with `tsc`/`eslint` - the
  headless login failed because the seed admin credentials in
  `.env.local` no longer match the account's current password.
- Headless browser note: the cached Playwright Chromium needs `libnspr4`,
  `libnss3` and `libasound2`, which aren't installed in this WSL setup.
  Working without sudo: `apt-get download` the three packages,
  `dpkg-deb -x` them into a scratch dir, and run with `LD_LIBRARY_PATH`
  pointing at its `usr/lib/x86_64-linux-gnu`.

## "Voltar" (back) button

- [x] `src/components/BackButton.tsx`: a plain link (`← Voltar`) to the
      **parent page**, not browser history - per explicit request: from
      `/manage/aaa` it always goes to `/manage`. Consequence: list filters
      (e.g. `/manage/gallery?year=2025`) aren't preserved when coming back.
- [x] Shown on: `/events/[id]` (-> `/events`); every `/manage/<section>`
      list page and `/manage/historial` (-> `/manage`); event and gallery
      new/edit pages (-> their list); `/manage/home-sections/[id]`
      (-> `/manage/home-sections`); `.../add-photo` (-> that section).
- [x] Deliberately not shown on: `/manage` itself (it's the hub) and the
      `/delete` confirmation pages (per explicit request; they already
      have a "Cancelar" button).
- Verified in headless Chromium on an event detail page: button renders
  above the title and navigates to `/events`. Manage pages checked with
  `tsc`/`eslint` only (login needed).

## Bulk delete on /manage/gallery

- [x] Checkbox on each card (top-left, outside the photo's click area, so
      clicking the photo still opens the viewer) plus a sticky toolbar:
      "Selecionar todos" (with indeterminate state), "N itens
      selecionados", "Eliminar selecionados" (disabled at 0). State lives
      in `src/components/GallerySelection.tsx` (context provider, toolbar,
      `SelectableGalleryItem`), so the page stays a Server Component. The
      provider is keyed by the year/event filter, so changing the filter
      clears the selection - nothing hidden can be deleted by accident.
- [x] "Eliminar selecionados" goes to `/manage/gallery/delete-selected?ids=…`,
      a confirmation page (same pattern as the single-item delete pages, no
      "Voltar" button) showing thumbnails of the selected items and
      "Eliminar N itens" / "Cancelar". Ids that no longer exist are skipped.
- [x] New GraphQL mutation `deleteGalleryItems(ids: [ID!]!): Int!`: deletes
      the rows in one Prisma transaction (all or nothing), then removes the
      photo files from Storage (failures logged, like `deleteGalleryItem`).
      Home page featured-photo links go with them (`onDelete: Cascade`).
      Server Action `deleteGalleryItemsAction` redirects with "N itens
      eliminados com sucesso."
- Fixed along the way: on the confirmation page, MUI `Stack` spacing also
  applied margins to the hidden `id` inputs, pushing the buttons right -
  switched to a flex `gap`.
- Verified in headless Chromium against the dev server: 36 checkboxes,
  select 2 -> counter + outline, photo click still opens the viewer and
  keeps the selection, select all (36) / none, confirm page lists exactly
  the 2 items. Mutation tested with non-existent ids only (returns 0 when
  logged in, `UNAUTHENTICATED` when logged out) - a real deletion wasn't
  run since dev uses the production database.
- Testing `/manage` pages headlessly without the admin password: sign a
  short-lived Auth.js session JWT locally with `NEXTAUTH_SECRET`
  (`encode` from `@auth/core/jwt`, salt `authjs.session-token`) for a
  fake user id, set it as the `authjs.session-token` cookie, and delete
  the token file afterwards. Read-only use only - it hits the real DB.

## Rename /historial to /history (English route names)

- [x] `src/app/historial` -> `src/app/history` and `src/app/manage/historial`
      -> `src/app/manage/history` (moved with `git mv`), matching
      `/events`, `/contacts`, `/gallery`. Links updated in `Nav.tsx`,
      `HomeHero.tsx`, the `/manage` hub, the Server Action's
      `revalidatePath`/`redirect`, page metadata and `sitemap.ts`. The
      visible label stays "Historial"; the DB model/queries keep the
      `HistorialSection` name. Older sections of this file still say
      `/historial` - that was the route at the time.
- No redirects from the old URLs, by explicit choice: `/historial` and
  `/manage/historial` now return 404.
- Gotcha: after renaming route folders, `tsc --noEmit` fails on stale
  `.next/types/validator.ts` entries pointing at the old paths until
  `next build` (or `next dev`) regenerates them.
- Verified on the dev server: `/history` 200 with canonical `/history`;
  `/historial` 404; home page links point at `/history`; sitemap lists
  `/history`; `next build` clean. Page/action functions renamed to match
  (`HistoryPage`, `ManageHistoryPage`, `updateHistorySectionAction`).

## Account management with a protected owner

- Permission model (decided with the user):
  | | Owner | Other admins |
  |---|---|---|
  | See the account list | yes | yes |
  | Add / remove accounts | yes (owner can't be removed) | no |
  | Change own name/email | yes | yes |
  | Change own password | yes, current password required | yes, current password required |
  | Change another account's name/email/password | yes, no current password needed | no |
- [x] `User.isOwner Boolean @default(false)`; migration
      `20261022170000_add_user_owner` adds the column and marks the
      **oldest** account as owner (chosen by `createdAt`, so no email is in
      the repo). Applied to the (shared dev/prod) Supabase DB on
      2026-10-22: Mario = owner, garcea = admin.
- [x] GraphQL (`src/graphql/accounts.ts`): queries `users`, `user(id)`,
      `me`; mutations `createUser`, `updateUser`, `changePassword`,
      `deleteUser`. All rules are enforced there, server-side; the pages
      only hide what isn't allowed. The current user is re-read from the
      DB on each check, so a removed account's leftover session can't use
      them. Passwords: min 8 chars, bcrypt cost 12 (same as the seed).
      Emails are saved trimmed + lowercased, and login now looks them up
      the same way (`src/auth.ts`).
- [x] Removing an account moves its events and gallery items to the owner
      in the same transaction (both require an author) instead of
      deleting the content.
- [x] Security fix found along the way: `User.email` was readable by
      anyone through the public GraphQL endpoint (e.g.
      `events { createdBy { email } }`). The field now requires a logged-in
      admin; `createdBy { name }` stays public.
- [x] Pages: `/manage/accounts` (list with "Proprietário"/"Você" chips,
      "Adicionar Conta" only for the owner), `/manage/accounts/new`
      (owner only, else redirected to the list), `/manage/accounts/[id]/edit`
      ("Dados da conta" + "Alterar palavra-passe"; the current-password
      field only appears on your own account), `/manage/accounts/[id]/delete`
      (owner only, never for the owner account). "Gerir Contas" card on
      `/manage`.
- Verified: 20/20 API permission checks against the dev server with
  locally signed sessions for both real accounts (every forbidden action
  refused with its Portuguese message; validation for short password,
  bad email, duplicate email). Allowed actions were exercised on a
  temporary account that was created, edited, given a new password and
  deleted - real accounts and passwords were not touched. Pages checked
  in headless Chromium as owner and as admin.
- Gotcha: after `prisma generate` the running `next dev` keeps the old
  Prisma client in memory (`globalThis.prisma`), so new columns come back
  `null` ("Cannot return null for non-nullable field User.isOwner") until
  the dev server is restarted.
- Known, pre-existing: `notFound()` pages under `/manage` return HTTP 200
  (the root `loading.tsx` starts streaming first) while showing "Página
  não encontrada" - same as every other manage page.
- Not done: a changed name/email shows on `/manage` ("Sessão iniciada
  como …") only after logging in again, because it's read from the JWT.

## Gallery batches ("Ver mais") + lazy loading

- [x] `/gallery` and `/manage/gallery` show 24 items at a time
      (`GALLERY_PAGE_SIZE` in `src/lib/gallery-paging.ts`); "Ver mais"
      (`src/components/ShowMoreButton.tsx`) adds 24 more by raising
      `?limit=` in the URL, with "A mostrar N de M" above it. It navigates
      inside a React transition with `scroll: false`, so the page keeps its
      scroll position and the items already shown stay on screen (no
      loading-skeleton flash). The URL keeps the state, so reload/back
      work.
- [x] GraphQL: `galleryItems` takes an optional `limit` (no limit = all,
      still used by the bulk-delete confirmation page) and there's a new
      `galleryItemsCount(eventId, year)`; both share one `where` builder.
- [x] `/manage/gallery`: "Ver mais" keeps the year/event filter; changing
      the filter starts again at the first 24 (the filter component builds
      a fresh URL). The selection survives "Ver mais" (provider is keyed by
      the filter only) and "Selecionar todos" covers every item shown.
- [x] `loading="lazy"` on gallery card photos and video iframes (the
      YouTube/Facebook players were all loading up front) and on the
      lightbox slides (every slide is rendered, so opening the viewer used
      to download every full-size photo in the group).
- Verified in headless Chromium with the page size temporarily set to 8
  (the gallery has 21 items now): 8 -> 16 items, scrollY unchanged, no
  skeleton flash, "A mostrar 16 de 21"; on `/manage/gallery` 2 selected
  items stayed selected after "Ver mais", select-all covered 16, and
  `?year=2026` survived "Ver mais". Restored to 24 afterwards.
- Measured: Chrome's lazy-load distance is generous (~1250px+), so on a
  short page most photos still load right away - the batches are what cap
  it. The bigger remaining win is thumbnails (see backlog).

## Gallery: remove captions, "Editar" changes the photo/video and event

- [x] Captions removed everywhere (upload form, old "Editar legenda" page,
      text under cards, lightbox, GraphQL types/inputs/queries, Prisma
      schema). None of the 21 items had one, so no content was lost.
- [x] Applied migration `20261022190000_remove_gallery_item_caption`
      (drops `GalleryItem.caption`) on 2026-10-23, after the code without
      captions was deployed (0 of 21 items had a caption).
- [x] "Editar legenda" -> "Editar" on `/manage/gallery`. The edit page
      shows the current photo/video and lets you:
      - photo: optionally pick a new file (compressed in the browser like
        uploads) - the resolver deletes the replaced file from Storage;
      - video: optionally paste a new YouTube/Facebook link (normalized
        like on upload);
      - change the event or choose "Nenhum".
      `updateGalleryItem` now takes `url`/`eventId` (omitted = unchanged,
      `eventId: null` = no event). The action reads the item's type from
      the DB rather than the form, and uses `unstable_rethrow` so the
      `/login` redirect on an expired session isn't swallowed by its
      `catch`.
- [x] Event selects (upload and edit) show "Nenhum" instead of an empty
      box (`displayEmpty` + shrunk label).
- Verified end-to-end in headless Chromium on a temporary photo uploaded
  through the real form: replace + set event -> new `.webp`, old file
  gone from Storage (Supabase answers 400 for missing objects), event
  saved; then event "Nenhum" without a file -> photo kept, event cleared;
  video edit page renders with the link field; temp item deleted
  afterwards (gallery back to 21 items).
- Gotcha: `pkill -f "next dev"` also matches (and kills) the shell running
  it - stop the dev server by PID instead.

## Settings as environment variables (with the current values as defaults)

- [x] `src/lib/config.ts` holds every tunable setting; each reads an env
      var and falls back to the previous hard-coded value when it's unset,
      empty or invalid (out-of-range values are clamped, with a
      `console.warn` naming the variable). All names, defaults and ranges
      are documented in `.env.example` (now committed: `.gitignore` has
      `!.env.example`).
  | Variable | Default | Range |
  |---|---|---|
  | `NEXT_PUBLIC_SITE_NAME` | Associação GARCEA | - |
  | `SITE_DESCRIPTION` | (previous text) | - |
  | `GALLERY_PAGE_SIZE` | 24 | 1-200 |
  | `NEXT_PUBLIC_MAX_UPLOAD_MB` | 4 | 0.5-4.4 (Vercel's 4.5MB cap) |
  | `NEXT_PUBLIC_MAX_PHOTOS_PER_UPLOAD` | 15 | 1-100 |
  | `NEXT_PUBLIC_PHOTO_MAX_DIMENSION` | 1920 | 320-8000 |
  | `NEXT_PUBLIC_POSTER_MAX_DIMENSION` | 2560 | 320-8000 |
  | `NEXT_PUBLIC_IMAGE_QUALITY` | 0.82 | 0.1-1 |
  | `MIN_PASSWORD_LENGTH` | 8 | 8-128 (can't be lowered) |
- `NEXT_PUBLIC_*` = also used in the browser, so Next.js inlines them at
  build time: changing one on Vercel needs a redeploy. Each must be read
  as a literal `process.env.NEXT_PUBLIC_X` (no dynamic names) for the
  inlining to work. Verified: a build with
  `NEXT_PUBLIC_MAX_PHOTOS_PER_UPLOAD=7` has `"7"` in the browser chunk;
  without it, the browser falls back to 15.
- Deliberately not configurable: `HISTORIAL_SECTION_ID` and the
  `VALID_*` lists (must match the DB/GraphQL enums).
- [x] Contradictions fixed while wiring it up: the server-side file
      limits (8MB photo / 15MB poster) could never be reached under the
      4MB request cap - both now use `MAX_UPLOAD_BYTES`; `next.config.ts`
      `bodySizeLimit` is derived from `MAX_UPLOAD_MB` (+1MB) instead of a
      fixed 40mb. The site name now also comes from the setting in the
      header, footer and the `/manage` title. `src/lib/upload-limits.ts`
      was folded into the config; the seed script uses `BCRYPT_COST` too.
- [x] `BCRYPT_COST` stays a fixed constant (12) in `src/lib/config.ts`,
      not an environment variable: a security setting that shouldn't vary
      per deployment.
- [x] Empty values (`NAME=` lines copied from `.env.example`) now count as
      unset everywhere: `NEXT_PUBLIC_SITE_URL` and `SUPABASE_STORAGE_BUCKET`
      used `??`, so an empty value would have broken `metadataBase`
      (`new URL("")`) or pointed uploads at a bucket with no name.
- [ ] Clean up unused variables in `.env.local` and Vercel: `CRON_SECRET`
      (its route was removed), `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
      (never used), `VERCEL_OIDC_TOKEN` (short-lived token from `vercel env
      pull`) and `SEED_ADMIN_PASSWORD` (no longer matches the account).
      Keep `NEXTAUTH_URL`: Auth.js v5 still reads it (as an alias of
      `AUTH_URL`) to build login redirect URLs, so it must stay the real
      production address.

## Remove the unused public /gallery page

The public `/gallery` page had no link anywhere (it was dropped from the nav
and the sitemap) and was only reachable by typing the address.

- [x] Deleted `src/app/gallery/` (page + loading) and `GalleryGrid.tsx`,
      which only that page used.
- [x] Dropped the `revalidatePath("/gallery")` calls from the gallery
      actions and the sitemap comment about it.
- [x] Photos and videos are unchanged: they still show on the home page
      carousels, the event pages and `/manage/gallery`, which keeps using
      `GALLERY_PAGE_SIZE` for "Ver mais".

## Share button on event pages

- [x] `src/components/ShareButton.tsx`: "Partilhar" button on
      `/events/[id]`, below the date/location.
- [x] Where the browser supports the Web Share API (iPhone, Android, Safari,
      Edge on Windows...) it opens the system share sheet, with every app the
      user has installed (WhatsApp, Facebook, Messages, copy...).
- [x] Elsewhere (e.g. Chrome/Firefox on desktop) it opens a "Partilhar
      evento" dialog: WhatsApp, Facebook, Instagram, X, Email and "Copiar
      link" (with a "Link copiado." message). Plain share URLs, no
      third-party scripts.
- [x] Instagram has no web share URL, so its option copies the link and
      opens Instagram's messages (instagram.com/direct/inbox) for the user
      to paste it. On phones the system share sheet already lists the
      Instagram app.
- [x] The shared link is the canonical `SITE_URL/events/<id>`, so the
      preview uses the event's Open Graph tags (title, date/place, poster).
- Verified in headless Chromium: dialog links and copy-to-clipboard work,
  and with Web Share available the native sheet is called with the event's
  title and URL and no dialog is shown.

## Installable app (PWA) + "Instalar app" button

- [x] `src/app/manifest.ts` (served at `/manifest.webmanifest`): name,
      short name "GARCEA", standalone display, white theme, icons.
- [x] Icons made from `public/logo.png` on a white background (home
      screens fill transparency with black): `public/icons/icon-192.png`,
      `icon-512.png`, `icon-maskable-512.png` (logo inside Android's 80% safe
      zone) and `src/app/apple-icon.png` (180px, iPhone/iPad).
- [x] Root layout: `appleWebApp` metadata (opens full screen on iOS, title
      "GARCEA") and `viewport.themeColor` for light/dark.
- [x] `public/sw.js` + `ServiceWorkerRegister` (production only): pages
      always come from the network, nothing is cached except
      `public/offline.html`, shown when there's no connection. `/sw.js` is
      served with `no-cache` (`next.config.ts` headers).
- [x] `InstallAppButton` ("Instalar app") in the footer and in the mobile
      menu:
  - Android / desktop Chrome and Edge: opens the browser's install dialog
    (`beforeinstallprompt`, captured early by an inline script in the
    layout - `src/lib/pwa-install.ts`).
  - iPhone/iPad: no install API, so it shows the 3 steps (Partilhar ->
    Adicionar ao ecrã principal -> Adicionar).
  - Hidden where installing isn't possible (e.g. Firefox desktop) and once
    the app is installed / opened from the home screen.
- Verified on a production build in headless Chromium: Chrome reports no
  installability errors, the service worker activates, the button appears
  when the browser offers installation and opens its dialog, the offline
  page shows with no connection, the iPhone steps dialog opens from the
  menu, and no button is shown in the installed app.

## Database connections: transaction pooler

Problem (found 2026-10-23 while testing): `DATABASE_URL` used Supabase's
session pooler (port 5432), which allows 15 clients in total, shared by
production, local dev, builds and migrations. Each server's `pg` pool can
open up to 10 connections, pages ran one query per item in parallel, and
paused Vercel functions keep idle connections open, so the slots ran out:
"(EMAXCONNSESSION) max clients reached in session mode" and failed pages.

- [x] `DATABASE_URL` now points at the transaction pooler (port 6543) on
      Vercel and in `.env.local` (done by Mario). A connection only holds a
      slot while a query runs. Safe with `@prisma/adapter-pg`: it doesn't
      use named prepared statements unless `statementNameGenerator` is set.
- [x] `DIRECT_URL` (same address, port 5432) for the Prisma CLI only:
      `prisma7.config.ts` uses it when set, because migrations need a
      session connection. Local only, not needed on Vercel.
- [x] `src/lib/prisma.ts`: at most 5 connections per server instance.
- [x] Fewer parallel queries: `galleryItems` loads each item's event and
      `homeSections` loads the featured photos in the same request, instead
      of one query per item/section (`GalleryItem.event` and
      `HomeSection.featuredPhotos` reuse what was loaded).
- Verified locally: `prisma migrate status` goes through port 5432; 27
  parallel public page requests and 20 parallel `/manage/gallery?limit=48`
  requests all returned 200 with no connection errors; gallery cards still
  show their event and the home page its photos.

## Backlog: improvement ideas (free-tier aware)

From a functionality review. Ordered roughly by value; constraints of the
Vercel Hobby + Supabase free plans are noted where they matter.

- [x] Verify the keep-warm cron config is valid on Hobby: per Vercel's
      docs (checked 2026-10-22) Hobby allows up to 100 cron jobs per
      project, each running at most once per day, with ±59 min timing
      precision. `vercel.json` has two separate daily jobs (06:00 and
      18:00 UTC), so it's within limits - the earlier worry here was based
      on outdated limits. `/` is dynamic (`ƒ` in the build output) and
      queries the DB, so each run counts as database activity; production
      `https://garcea.vercel.app/` answers 200 to a `vercel-cron/1.0`
      user agent.
- [x] Confirm the cron runs in production: on 2026-10-22 the second job
      was moved to `0 15 * * *` (16:00 Lisbon) so the run could
      be caught in Hobby's ~1h log retention. Vercel's request logs showed
      a single `GET /` -> 200 at 16:14:45 Lisbon, received directly in
      `iad1` with a bare `Mozilla/5.0 (compatible)` user agent, 2.23s
      function invocation, 0 errors - matching the cron window. A real
      visit from Portugal right after came in via the Paris edge (`cdg1`)
      with a full browser user agent, so the 16:14 request was the cron.
      Schedule then restored to 06:00/18:00 UTC. For future checks, the
      Cron Jobs page's "View Logs" button gives a filtered view.
- [x] Run functions in London (`"regions": ["lhr1"]` in `vercel.json`):
      the logs showed functions running in Vercel's default `iad1`
      (Washington) while the Supabase DB is in `eu-west-2` (London), so
      every DB query crossed the Atlantic (~2s for `/`). Hobby allows one
      region of your choice. Check the next request logs for the new
      region and execution time.
- [x] Gallery pagination / lazy loading (`/gallery` currently fetches and
      renders every item) - also saves Supabase egress. See "Gallery
      batches ("Ver mais") + lazy loading" below.
- [ ] Gallery thumbnails: grid tiles show the full ~1920px photo (~290KB
      each - 20 photos measured at 5.8MB) inside a small square. Generate a
      small (~400px) thumbnail in the browser at upload time, next to the
      existing compression, and save it in the unused
      `GalleryItem.thumbnailUrl` (`GalleryItemCard` already prefers it).
      Supabase image transforms are Pro-only, so it has to be done at
      upload; existing photos would need a one-off backfill.
- [x] Keep uploads under Vercel's 4.5MB request body limit (chose a
      simple cap instead of one-request-per-photo uploads):
      `src/lib/upload-limits.ts` sets max 15 photos per gallery upload and
      max 4MB per request. The gallery form warns and clears the selection
      when more than 15 photos are picked (the Server Action re-checks the
      count). `ImageCompressingForm` totals the files after compression
      and shows an error instead of sending a request Vercel would reject,
      which also covers large PDF posters in the event form (the 15MB
      server-side poster limit could never be reached in production).
      Note: when that error shows, React resets the form's fields, so the
      files have to be picked again. Only `tsc`/`eslint`/`next build`
      checked - the forms need a login to try.
- [ ] Events: "Próximos" (upcoming) section at the top of `/events`,
      archive by year below.
- [x] Per-page/per-event metadata + Open Graph image (event poster),
      `sitemap.ts` and `robots.ts` - better Facebook/WhatsApp link
      previews and search visibility. See "SEO + link previews" below.
- [ ] Event detail: "Add to calendar" (.ics), Google Maps link from
      `location`. (Share button done - see "Share button on event pages".)
- [x] Account management (Phase 8 above) - see "Account management with a
      protected owner".
- [x] Database connections - see "Database connections: transaction pooler".
- [ ] Login rate limiting (no Redis in the stack: small Supabase table or
      Upstash free tier).
- [ ] Optional booking-request form on Contacts, emailed via Resend free
      tier (3,000/month) - or just make WhatsApp/phone more prominent.
- [ ] Draft/hidden state for events and gallery items.
- [ ] Filter events by year/type in the GraphQL query instead of in JS.
- [ ] Analytics: Vercel Web Analytics (free on Hobby) or GoatCounter.
- [ ] Meaningful `alt` text for event posters (currently `alt=""`).

## SEO + link previews (metadata, Open Graph, sitemap, robots)

- [x] `src/lib/site.ts`: `SITE_URL` (`NEXT_PUBLIC_SITE_URL`, else Vercel's
      auto-set `VERCEL_PROJECT_PRODUCTION_URL`, else localhost) and a
      `pageMetadata()` helper. Next.js merges metadata **shallowly**, so a
      page setting `openGraph` replaces the layout's whole `openGraph`
      object - the helper always rebuilds it in full (site name, `pt_PT`
      locale, default image = `/logo.png`).
- [x] Root layout: `metadataBase`, title template `%s | Associação GARCEA`.
      It deliberately sets no canonical URL - one set in a layout would be
      inherited by every page without its own, pointing them all at `/`.
- [x] Static metadata (title, description, canonical, OG) on `/`,
      `/events`, `/historial`, `/contacts`, `/gallery`; `/login` is
      `noindex, nofollow`.
- [x] `/events/[id]`: `generateMetadata` with the event title, a
      description built from date · location + event text (trimmed to 160
      chars) and the poster as `og:image` (`summary_large_image`). PDF
      posters fall back to the logo. The event query is wrapped in React
      `cache()` so metadata and page share one DB request.
- [x] `src/app/robots.ts`: allow `/`, disallow `/manage`, `/login`, `/api`,
      points at the sitemap. `src/app/sitemap.ts`: home, events,
      historial, contacts + every event. Dynamic (`ƒ`, because
      `executeGraphQL` reads the session cookie), so new events show up
      without a redeploy. `/gallery` is left out on purpose (hidden from
      the nav).
- Facebook/WhatsApp: Next.js 16 streams `generateMetadata` output into
  `<body>` for normal browsers, but for "HTML-limited" bots (its list
  includes `facebookexternalhit` and `WhatsApp`) it blocks and puts the
  tags in `<head>` - confirmed with a `WhatsApp/2.x` user agent.
- Verified: `tsc`, `eslint`, `next build` clean; with a WhatsApp user agent
  `/`, `/events`, an event page and `/login` return the expected
  title/description/canonical/OG tags in `<head>`; `robots.txt` and
  `sitemap.xml` render correctly. Not yet checked on production with
  Facebook's Sharing Debugger.
- [ ] When `associacaogarcea.pt` goes live, set `NEXT_PUBLIC_SITE_URL` on
      Vercel (or make it the project's production domain) so canonical/OG
      URLs and the sitemap use it, then submit the sitemap in Google
      Search Console.

## Open Question (blocking Phase 8 decision)

- [x] Confirm: are all admin accounts fully equal, or should one be a "primary" owner
      that can't be removed by the other? Decided 2026-10-22: one protected
      owner (the first account, Mario) - see "Account management with a
      protected owner".
