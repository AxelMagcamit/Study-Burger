# Release testing

## Automated checks

Run `npm test`, `npm run build`, then `npm run typecheck`. The existing GitHub Actions workflow runs the same gates. Node tests cover scheduling, validation, ingestion, draft handling, request boundaries and mocked authentication/provider behavior.

`supabase/verify-security.sql` contains rollback-only database integration checks. Run them only on the intended project with appropriate access; never reapply the production schema merely to validate a visual change.

## Browser checklist

Use desktop (1440px), tablet (768px) and mobile (360px), both themes. Also test 200% zoom, reduced motion and keyboard-only navigation.

- Welcome: Google button, sample entry, theme switch, privacy and navigation links.
- Dashboard: deck filters/search, create/edit/delete, statistics, goal settings and backup export/import.
- Editor: text/document import, card edits, add/remove, save and discard warning.
- Study: Space flip, arrows and 1/2/3 ratings, Again retry, session completion and exit. Long card content must scroll without covering controls.
- Dialogs: visible focus, Escape, close control, focus return and mobile scrolling.
- Design: correct Ponpon mood, no horizontal overflow, readable contrast and no clipped labels.

## Real accounts and providers

Use your own authorized test accounts; do not share passwords or keys.

1. Sign in with Google account A, create a deck and review cards. Reload and confirm persistence.
2. Sign out. Verify account data is no longer accessible in the signed-out UI.
3. Sign in with Google account B. Verify A's decks are absent; create B's own deck.
4. Return to A and confirm each account retains only its own data.
5. Open two tabs, edit stale data and verify conflict recovery instead of silent overwrites.
6. Generate cards from short text, review/edit/save them, then test a clear image and short audio file.
7. Cancel processing and retry. Check that completed media processing removes its private upload and that errors remain actionable.
8. Check browser console/network errors without copying sensitive request contents into reports.

Record **passed**, **failed**, or **not run** with the deployment tested. Provider mocks, READY status and a successful AI Studio playground response do not independently verify these flows.
