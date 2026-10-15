# Google AI Studio setup

Study Burger now calls the Gemini Developer API directly for flashcards, image OCR and audio transcription. OpenAI is no longer used. No paid fallback or automatic billing upgrade is implemented.

1. Open https://aistudio.google.com/api-keys and create an API key for a project on the Free tier. Check the project's billing tier; an API key itself does not guarantee free usage. Do not enable paid billing to follow this setup.
2. In https://vercel.com/ponpon2/study-burger/settings/environment-variables add `GEMINI_API_KEY` as a Production secret. Never paste it into chat, GitHub, or a NEXT_PUBLIC variable.
3. `GEMINI_MODEL` defaults to `gemini-3.8-flash`. Set this exact value in Vercel Production. Set it to `gemini-2.5-flash` only if your Google project has access. Supported IDs are `gemini-3.8-flash`, `gemini-3.7-flash`, `gemini-2.5-flash`, and `gemini-3.5-flash-lite`.
4. Redeploy the existing Study Burger Production deployment. Keep https://study-burger.vercel.app.
5. With a real signed-in account, test generation, editing and saving, a clear PNG/JPG, a short MP3/WAV, cancellation and retry, and private Storage cleanup. Record the results using [the testing checklist](testing.md); provider access alone is not an end-to-end app test.

## Model availability checked 2026-10-13

Google documents Gemini 3.7 Flash as deprecated and automatically routed to Gemini 3.8 Flash. Use the current 3.8 ID. The legacy 3.7 ID is retained, but this is not a promise that Google serves the older model. Gemini 2.5 Flash is limited to projects that actively used it previously. Temporary server/network failures and short rate-limit cooldowns now receive bounded retries, then fall back to Gemini 3.5 Flash-Lite (or 3.8 Flash when Flash-Lite is primary). Both have free-tier access; billing settings are unchanged. A request has at most four provider attempts within a 90-second deadline. Daily quota errors, long cooldowns, invalid input, and credentials errors are not retried. This improves recovery but does not guarantee uninterrupted AI availability.

- https://ai.google.dev/gemini-api/docs/models/gemini-3.7-flash
- https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash
- https://ai.google.dev/gemini-api/docs/pricing

## Limits and privacy

Free quotas are shared by the Google project, not granted separately to each Study Burger user. Existing database quotas remain enforced; Google's tighter limits can reject a request earlier. Short HTTP 429 cooldowns honor Retry-After/RetryInfo; daily quota exhaustion stops immediately. No billing upgrade is performed. Manual cards remain available.

Documents support up to 100 MiB locally. Images/audio support up to 50 MiB, the Supabase Free per-file cap. Extracted text remains limited to 120,000 characters, PDFs to 300 pages and slides to 400. Media up to 12 MiB is inline; larger media uses Google Files API, with processing-state polling and deletion in finally using an independent timeout. Google expires orphaned uploads after 48 hours. Private Supabase cleanup runs after processing and client cancellation; abandoned uploads may remain until a later upload cleans files older than a day. Existing projects must set the private study-media bucket limit to 52,428,800 bytes (50 MiB); do not rerun schema.sql.

Google may use free-tier input/output to improve its products. The editor and privacy page disclose this. Avoid confidential material. Generation results require review; audio is model-based transcription and may be imperfect. See https://ai.google.dev/gemini-api/terms.

The owner confirmed a Gemini 3.8 playground response on 2026-10-13. This does not verify API-key access, application generation, OCR, or transcription.
