# Study Burger — release status

Updated 2026-10-12. Production origin: https://study-burger.vercel.app.

## Implemented and checked

- Concise landing page, dashboard labels, editor instructions, and study feedback.
- Original cream, sunflower yellow, and charcoal palette retained.
- Original Ponpon artwork preserved with welcome, reading, thinking, celebration, rest, concerned, and searching variants. SVGs are small, valid, and visually checked; animation respects reduced motion.
- Google PKCE sign-in initiation and sign-out return actionable inline errors. Callback failures return to the app; authorization requires a verified Google identity.
- New accounts start empty; sample decks remain available without signing in.
- Unsaved account changes are stored in this tab, scoped by account ID, and offered for recovery. Revision conflicts require export or keeping saved data, preventing silent overwrites. Drafts clear after save, discard, or successful sign-out.
- Deck editing warns before discarding changes. Back navigation retains cards. Partial AI generation is retained if a later chunk fails. Changed card content resets its review schedule.
- Flashcard content is labeled for assistive technology. Space works after rating; focus returns to the next card. Again/Good/Easy scheduling and existing progress tracking remain intact.
- Backup import, account storage limits, card limits, and unavailable AI uploads have actionable errors.

## Verification

- 24 Node tests passed: scheduling, streaks, validation, drafts, edited-card scheduling, text ingestion, cancellation, bounded request bodies, anonymous denial, OAuth PKCE cookie settings, fixed callback redirects, and verified Google identity restrictions.
- Next.js production build and TypeScript checks passed.
- Live Supabase rollback-only tests passed: ownership, revisions, quota limits, job leases, uploads, private-table denial, anonymous denial. Test fixtures were rolled back.
- Supabase security advisors reported only informational notices on three intentionally private deny-all tables; no warning/error findings.
- OAuth tests use a controlled provider fixture. They do not constitute a real Google login test.
- Browser-based desktop/tablet/mobile and live console verification were unavailable in this environment. Responsive rules, semantic controls, focus handling, and reduced-motion rules were reviewed in source, not confirmed in a browser.

## Launch blockers — owner configuration required

### Google

Live Supabase settings returned `google_enabled: false`; Vercel `GOOGLE_AUTH_ENABLED` is false. The connector does not expose Auth-provider configuration. No Google client secret is available to this session.

1. In https://console.cloud.google.com/auth/clients, create/configure a Web application OAuth client for Study Burger.
2. Authorized origin: `https://study-burger.vercel.app`.
3. Google authorized redirect: `https://vrkygytugewkxsbyzluy.supabase.co/auth/v1/callback`.
4. In https://supabase.com/dashboard/project/vrkygytugewkxsbyzluy/auth/providers, enable Google and enter its client ID and secret. Keep nonce checks enabled.
5. Supabase URL configuration: Site URL `https://study-burger.vercel.app`; allow `https://study-burger.vercel.app/auth/callback`.
6. In Vercel production, set `GOOGLE_AUTH_ENABLED=true` and redeploy the existing project.
7. Verify real sign-in, new-account creation, reload, saving, logout, and two-account isolation. Google manages password recovery; Study Burger has no separate password.

### AI

Vercel has no `OPENAI_API_KEY`. Configure it as a production secret at https://vercel.com/ponpon2/study-burger/settings/environment-variables and redeploy. Never put keys in chat, GitHub, or NEXT_PUBLIC variables. Then test generation, image OCR, audio transcription, cancellation, and cleanup with a real account.

The application currently supports the public sample workflow. It must not be described as ready for fully functional public accounts or AI until these gates pass.

## Deployment

Use existing Vercel project `prj_oHCBziGESkSd6aQguc9zMUX8dGIG`, team `team_V97eEbdEhUlHykiiNxfqC0IW` (ponpon2). Keep `APP_URL=https://study-burger.vercel.app` and the existing redirects from Ponpon aliases. No new project/domain is needed.

The connector's exact project ID with inferred scope works for deployments and settings. Explicit teamId, build-log access, and protected-fetch metadata have returned 403. No authenticated CLI is available. Source uploads work; GitHub automatic deployment is not verified. Check terminal READY and primary alias after each release.
