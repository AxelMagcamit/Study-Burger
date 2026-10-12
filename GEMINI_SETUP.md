# Google AI Studio setup

Study Burger now calls the Gemini Developer API directly for flashcards, image OCR and audio transcription. OpenAI is no longer used. No paid fallback or automatic billing upgrade is implemented.

1. Open https://aistudio.google.com/api-keys and create an API key for a project on the Free tier. Check the project's billing tier; an API key itself does not guarantee free usage. Do not enable paid billing to follow this setup.
2. In https://vercel.com/ponpon2/study-burger/settings/environment-variables add `GEMINI_API_KEY` as a Production secret. Never paste it into chat, GitHub, or a NEXT_PUBLIC variable.
3. `GEMINI_MODEL` defaults to `gemini-3.8-flash`. Set this exact value in Vercel Production. Set it to `gemini-2.5-flash` only if your Google project has access. Supported IDs are `gemini-3.8-flash`, `gemini-3.7-flash`, and `gemini-2.5-flash`.
4. Redeploy the existing Study Burger Production deployment. Keep https://study-burger.vercel.app.
5. With a real signed-in account, test generation, editing and saving, a clear PNG/JPG, a short MP3/WAV, cancellation and retry, and private Storage cleanup. No live Gemini request has been verified without the production key.

## Model availability checked 2026-10-13

Google documents Gemini 3.7 Flash as deprecated and automatically routed to Gemini 3.8 Flash. Use the current 3.8 ID. The legacy 3.7 ID is retained, but this is not a promise that Google serves the older model. Gemini 2.5 Flash is limited to projects that actively used it previously. There is no silent application fallback to other model IDs.

- https://ai.google.dev/gemini-api/docs/models/gemini-3.7-flash
- https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash
- https://ai.google.dev/gemini-api/docs/pricing

## Limits and privacy

Free quotas are shared by the Google project, not granted separately to each Study Burger user. Existing database quotas remain enforced; Google's tighter limits can reject a request earlier. HTTP 429 produces a retry-later message, without automatic paid retries. Manual cards remain available.

Images/audio are capped at 12 MiB before upload and again on the server, leaving room for base64 within inline request budgets. Documents remain capped at 20 MiB. Files go through private Supabase Storage and are sent inline to Gemini, so no second temporary Google Files API object is created. Existing Supabase cleanup still runs in finally on processing success/failure. Abandoned uploads may remain until a later upload cleans files older than a day.

Google may use free-tier input/output to improve its products. The editor and privacy page disclose this. Avoid confidential material. Generation results require review; audio is model-based transcription and may be imperfect. See https://ai.google.dev/gemini-api/terms.

The owner confirmed a Gemini 3.8 playground response on 2026-10-13. This does not verify API-key access, application generation, OCR, or transcription.
