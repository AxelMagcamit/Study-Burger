# Release status

## Profile and authenticator settings, November 2, 2026

- Optional authenticator-app 2FA setup, verification at login, and removal with a fresh authenticator code. Email and Google callback flows preserve the session while asking for the second factor. No recovery codes are provided; users are prompted to keep an authenticator backup before enabling.
- MFA enforced in server account access, profile/account RLS, private media RLS and the existing write RPC. Rollback-only database assertions passed for AAL1 denial, AAL2 access, non-enrolled access and profile ownership. Test fixtures were rolled back.
- Private nickname and cropped profile photo settings; photos are resized to 128px JPEG and stored outside auth tokens. Explicit Save and Remove photo controls.
- Sign out is visible in the top bar and sidebar. Account labels support both email and Google.
- Existing 51 automated tests passed, plus a focused MFA regression test; production build and TypeScript passed. Real-user authenticator enrollment and photo persistence have not been exercised in a signed-in browser.
- Database setup: apply `supabase/profile-mfa.sql` after the original schema on new installations.

## Mobile sign-in recovery, November 2, 2026

- Google sign-in uses a native same-origin form and stays usable while the existing-session check is pending or unavailable. The prior fix is confirmed in production deployment `dpl_9sNQJPRsnQDU6gdMF84MABXH5zgQ` (`d3db2a4`).
- Session checks now use an AbortController with a cleared timer instead of newer AbortSignal.any/timeout APIs, so older mobile browsers can run the check. Unmounting cancels the request without showing a spurious error.
- Returning with browser Back resets the Google button's submitting state, allowing another sign-in attempt after cancellation.
- Added coverage for the native form's 303 authorization redirect, PKCE challenge, HttpOnly cookie and no-store response.
- All 50 tests, the production build, TypeScript and whitespace checks passed for this follow-up.
- Before this follow-up deployment, a live browser click reached the configured Supabase `/auth/v1/authorize` endpoint. The test browser then encountered an upstream connection failure. Real Google account sign-in, callback completion and physical iPhone behavior remain unverified.

## Full-body Ponpon animation, October 16, 2026

- Reused Ponpon's existing face, sunflower petals, palette and proportions in a lightweight SVG rig. Body sway, paw waves, toe taps, tail movement and blinks replace whole-image rocking. Completion uses a full-body hop and two-paw cheer; reading, thinking, resting and error states use calmer motions.
- Pause/play controls on welcome, dashboard and study screens remember the preference locally. Device reduced motion overrides animation, and hidden tabs pause. No accounts, AI configuration, deck data or scheduling changes.
- Existing 42 tests and three new mascot rendering/accessibility guards passed. Production build, TypeScript and whitespace checks passed.
- Release `ee59f6f` reached READY on the existing production project; the primary `study-burger.vercel.app` alias and both Ponpon aliases point to deployment `dpl_9yXQ7F7WWNjswso4yjENZAWafcLB`.
- Live desktop browser verification passed: independent body/head/tail/paw animations, pause of all animated groups, persisted pause after reload, keyboard playback, dashboard reading pose, six-card sample session and completion hop with separate left/right paw cheers. Screenshots confirmed the original palette and character remain intact. Reduced-motion behavior was checked in source/tests; physical mobile-device motion and live-account flows were not retested for this presentation-only change.
- Implementation and manual QA checklist: [Ponpon animation](docs/ponpon-animation.md).

## Multiple choice and editable card formats, October 16, 2026

- New generation format: Multiple choice, with four distinct options, one correct answer and an explanation. Server validation rejects malformed AI output.
- Edit deck exposes a format selector on every card, including older cards. Multiple-choice conversion preserves the old answer as the first suggested option; users must complete and review the other choices. Fill-in-the-blank conversion requires editing the question to include `_____`. Changes are saved only when Save deck is selected.
- Quiz sessions shuffle choices, support keyboard selection (1–4), show correct/incorrect feedback, and report correct attempts. Continue saves the review: correct answers use Good scheduling; incorrect answers use Again and return after one minute.
- Optional card fields preserve legacy data compatibility. Account validation, backups and unsaved drafts retain quiz options and formats. Changing content or format resets that card's schedule; unchanged cards retain progress. No database schema, RLS or authentication changes.
- All 42 automated tests passed, including generation, invalid options, answer identity after shuffling, legacy conversion, scheduling reset and backup/draft round trips. The production build, TypeScript and whitespace checks passed.
- Production release `9a6298e` reached READY on the existing Vercel project and `study-burger.vercel.app`. Cloud-browser sample-mode verification passed: convert an older card, edit its four options, save it for the visit, see shuffled options, select with the keyboard, check the correct answer, and continue to the next flashcard with the review recorded. The original hand-drawn appearance was visually checked.
- Live signed-in Gemini generation and account persistence have not been independently exercised. Local Chromium installation was unavailable, so the public sample flow was verified in the cloud browser instead. Mobile-specific visual checks and production runtime logs remain unverified.

## Upload limits and AI recovery, October 15, 2026

- Documents: 100 MiB, parsed in the browser. Existing text/page/expanded-archive limits remain to protect browser memory.
- Images/audio: 50 MiB. The live private `study-media` bucket was updated from 20 MiB to 50 MiB and checked with a follow-up query. Supabase Free cannot store a single 100 MiB object.
- Gemini generation, OCR and transcription retry temporary errors and short cooldowns, then use a second Flash model. Daily quota exhaustion and long cooldowns stop without repeated calls. Total generation time is bounded to 90 seconds.
- Media over 12 MiB uses Google Files API with state polling and best-effort deletion after completion/failure/cancellation. Google expires orphaned uploads after 48 hours. Client cancellation also requests private Storage cleanup.
- Failed uploads can be retried from the editor. Notes and partial cards remain available during the open editing session, and manual card creation remains available during AI outages.
- 36 automated tests passed, including simulated overload/fallback, quota handling, cancellation, media boundaries and Google file cleanup. Production build and TypeScript checks passed.
- Real-account 50 MiB media upload/transcription and fallback model access have not been independently verified. Production runtime logs returned 403, so the original provider incident cannot be confirmed from logs. Free-tier quotas and provider outages can still interrupt AI generation; uninterrupted availability is not promised.

## Hand-drawn interface release

Production origin: **https://study-burger.vercel.app**. The existing Vercel project and Ponpon alias redirects are preserved.

### Changes

- Sketchbook styling across welcome/sign-in, dashboard, decks, editor, study, progress, settings/help and privacy.
- Original cream, sunflower yellow and charcoal colors, dark theme and Ponpon artwork preserved.
- Local Kalam heading font, paper dots, irregular ink outlines, marker highlights and offset shadows; readable body and card text retained.
- Reduced-motion and forced-color handling, responsive layouts and visible keyboard focus.
- Documentation organized under `docs/`, with root setup links retained. No database, authentication, AI or scheduling changes.

### Verification for this release

30 Node tests passed. The Next.js production build, TypeScript checks and whitespace validation passed. No functional server or data changes were introduced. Browser visual QA is not available in the current managed environment; responsive and accessibility rules are reviewed in source only.

### Existing functionality and remaining checks

The owner reported that everything works after the Google/Gemini setup. Production Google enablement and presence of a Gemini secret were confirmed in the preceding release; secret values were not inspected. Older statements that both integrations are disabled have been removed.

That report does not substitute for independently recorded real Google registration/login/logout, two-account isolation, live OCR/audio, cancellation and cleanup tests. Follow [the checklist](docs/testing.md) before claiming those gates independently verified.

Earlier checks passed for database ownership, revision conflicts, quota enforcement, upload ownership and anonymous denial using rollback-only SQL tests. They were not rerun for this visual-only release.

GitHub automatic deployment remains unverified. Production releases use the exact committed source uploaded to the existing Vercel project. See [deployment](docs/deployment.md).
