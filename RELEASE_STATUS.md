# Release status

## Multiple choice and editable card formats, October 16, 2026

- New generation format: Multiple choice, with four distinct options, one correct answer and an explanation. Server validation rejects malformed AI output.
- Edit deck exposes a format selector on every card, including older cards. Multiple-choice conversion preserves the old answer as the first suggested option; users must complete and review the other choices. Fill-in-the-blank conversion requires editing the question to include `_____`. Changes are saved only when Save deck is selected.
- Quiz sessions shuffle choices, support keyboard selection (1–4), show correct/incorrect feedback, and report correct attempts. Continue saves the review: correct answers use Good scheduling; incorrect answers use Again and return after one minute.
- Optional card fields preserve legacy data compatibility. Account validation, backups and unsaved drafts retain quiz options and formats. Changing content or format resets that card's schedule; unchanged cards retain progress. No database schema, RLS or authentication changes.
- All 42 automated tests passed, including generation, invalid options, answer identity after shuffling, legacy conversion, scheduling reset and backup/draft round trips. The production build, TypeScript and whitespace checks passed.
- Live signed-in Gemini generation and account persistence have not been independently exercised. Browser visual testing was blocked by an unavailable Chromium installation; the download returned an invalid archive. Existing production runtime-log access remains unavailable.

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
