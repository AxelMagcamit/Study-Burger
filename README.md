# Study Burger — Ponpon edition

React 19, Next.js 16, Tailwind, Supabase Auth/Postgres/Storage, and Google Gemini.

## Current deployment status

The existing Sites publication remains at https://study-burger.crispbook.chatgpt.site.
Vercel production deployment is READY at https://study-burger.vercel.app. See RELEASE_STATUS.md for current checks and launch blockers. The deployment uses the exact committed source uploaded through the Vercel API; GitHub automatic deployment is not verified.

- Vercel project: `prj_oHCBziGESkSd6aQguc9zMUX8dGIG` (`study-burger`)
- Vercel account/team: `team_V97eEbdEhUlHykiiNxfqC0IW` (`ponpon2`)
- Supabase project: `vrkygytugewkxsbyzluy` (Tokyo)
- Primary application origin: `https://study-burger.vercel.app` (APP_URL).
- Supabase schema is already applied to the project above. Do not replay it there.
- Google provider and Google Gemini key still require owner configuration. No credentials are included.

## Run locally

Use Node.js 24. Run `npm ci`, copy `.env.example` to `.env.local`, fill in the publishable Supabase key, then run `npm run dev`. Open http://localhost:3000. The sample workspace works without credentials and is intentionally temporary.

Set `APP_URL` to the exact application origin. Set `GOOGLE_AUTH_ENABLED=true` only after completing GOOGLE_AUTH_SETUP.md. `GEMINI_API_KEY` is server-only; it enables generation, image OCR, and audio transcription. Never use a service-role key or NEXT_PUBLIC variable for secrets.

For a new Supabase project, apply supabase/schema.sql once through the SQL editor or migration tooling. The original connected project already has this schema.

## Vercel deployment

Use the existing project above. The connector succeeds with the exact project ID and its token-inferred team scope; explicitly passing teamId produced a 403. Some build-log and protected-fetch operations still return 403. Direct source deployment succeeded after Git import returned git_info_fail. Connect GitHub automatic deployment in Vercel before relying on push-to-deploy. Do not create duplicate projects.

Settings: Next.js; Node 24; install `npm ci`; build `npm run build`; region Tokyo (`hnd1`). Configure server environment variables from .env.example. Set APP_URL to the actual assigned production URL. Production must be publicly accessible; do not remove protection from unrelated projects. Update Google and Supabase redirects to that exact domain, then verify login/logout with two distinct Google accounts.

## Main source

- app/api/account/route.ts — authenticated account reads and revision-aware saves
- lib/auth.ts, app/auth/ — Google OAuth, PKCE, server cookies, verified identities
- lib/supabase-store.ts — authenticated database RPC and AI lease handling
- supabase/schema.sql — RLS, private quota/lease functions, storage access rules
- supabase/verify-security.sql — rollback-only database integration checks
- lib/ingest.ts — PDF/Office/text extraction; direct signed media uploads
- app/api/media-upload/route.ts — per-user signed upload paths
- app/api/extract/route.ts — OCR/transcription; deletes processed media
- lib/ai.ts, app/api/generate/route.ts — structured AI flashcards
- components/DeckEditor.tsx — import, preview, edit, add/delete cards
- components/StudyScreen.tsx, lib/study.ts — animated recall and scheduling
- hooks/use-study-account.ts — serialized saves with conflict detection
- app/ponpon.css, public/ponpon.svg — responsive Ponpon theme

## Limits and behavior

Documents: 20 MB. Images/audio: 12 MB. PDF: 300 pages. Slides: 400. Text: 120,000 characters. Office archives have expansion bounds. Images/audio upload directly to a private Supabase bucket, avoiding Vercel's function request-size limit. Source media is removed after extraction; abandoned files older than one day are cleaned when that user begins another upload. Owners should periodically clean abandoned objects through Storage administration if a user never returns.

Postgres enforces 2 MB per account, 1,000 saves/hour, 30 AI units/user/day, 300 AI units/site/day, and 30 upload authorizations/user/day. AI costs: generation 1, OCR 2, transcription 5. Quotas use UTC days and are transactionally updated; provider failures may consume units. One AI lease per user expires after three minutes. These are request limits, not billing caps.

Space flips cards; arrows or 1/2/3 rate Again/Good/Easy. Again returns after one minute. Good starts at one day and doubles; Easy starts at four days and triples. Mastery requires three consecutive successful recalls and an interval of at least seven days. Sessions contain at most 50 due cards.

## Verification

`npm test` (29 passing tests), `npm run typecheck`, `npm run build`. The rollback-only SQL checks have passed against the connected Supabase project. Browser end-to-end Google login, real Google Gemini calls, direct media upload, and browser production checks remain pending. Vercel reports production READY and confirms the domain alias; automated HTTP verification was blocked by this environment’s proxy and connector inspection permissions.

Gemini setup and current model availability: [GEMINI_SETUP.md](GEMINI_SETUP.md).
