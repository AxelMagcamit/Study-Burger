# Architecture

Study Burger uses the Next.js App Router. The public sample workspace is memory-only; signed-in accounts use Supabase. Gemini calls run on the server.

| Area | Entry points | Responsibility |
| --- | --- | --- |
| Welcome and session | `components/Entry.tsx`, `app/api/session/route.ts` | Check session, show Google sign-in or open the workspace |
| Google authentication | `components/GoogleSignIn.tsx`, `app/auth/`, `lib/auth.ts` | OAuth initiation, PKCE callback, verified identity and logout |
| Workspace | `components/Dashboard.tsx` | Decks, statistics, settings, backup actions and navigation |
| Account persistence | `hooks/use-study-account.ts`, `app/api/account/route.ts`, `lib/supabase-store.ts` | Serialized saves, revision conflicts and account-scoped draft recovery |
| Card creation | `components/DeckEditor.tsx`, `lib/ingest.ts` | Import, extract document text, preview, edit and save |
| AI | `lib/ai.ts`, `app/api/generate/route.ts` | Bounded Gemini requests and validated structured cards |
| Media | `app/api/media-upload/route.ts`, `app/api/extract/route.ts` | Private signed uploads, OCR/transcription and cleanup |
| Review | `components/StudyScreen.tsx`, `lib/study.ts` | Card flip, rating, next-review scheduling and completion |
| Data rules | `supabase/schema.sql` | Owner-only access, revisions, quotas and private storage |
| Design | `app/handdrawn.css`, `components/Ponpon.tsx`, `public/ponpon/` | Sketchbook theme and existing context-aware mascot |

## Data flow

Authenticated browser requests reach server routes, which verify the Google identity and use the user's Supabase session. Database ownership rules remain authoritative. Autosaves carry a revision; stale writes are rejected rather than silently overwriting newer progress.

Documents are extracted in the browser. Generated cards send selected extracted text to Gemini. Images and audio first use private signed Storage uploads, then the server sends their content inline to Gemini. Processing cleans up media in its completion path; abandoned objects older than a day are cleaned when that user starts another upload. An administrator must handle abandoned media from users who never return.

## Limits

Documents: 20 MB. Image/audio: 12 MB. Extracted text: 120,000 characters. PDF: 300 pages. Slides: 400. Account data: 2 MB. Study sessions: up to 50 due cards.

Database limits include 1,000 saves/hour, 30 AI units/user/day, 300 AI units/site/day and 30 upload authorizations/user/day. Generation uses 1 unit, OCR 2 and transcription 5. Provider failures can consume units. These are request limits, not billing caps. See the SQL for authoritative enforcement.

## Scheduling

Again returns after one minute. Good starts at one day and doubles; Easy starts at four days and triples. Mastery requires three consecutive successful recalls and at least a seven-day interval. Content edits reset the edited card's review schedule.
