# Release status

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
