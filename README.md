# Study Burger

A flashcard study app with Ponpon, a sunflower-collared cat. Create cards from your notes, review them with spaced repetition, and save your progress with Google sign-in.

**[Open Study Burger](https://study-burger.vercel.app)** · **[Documentation](docs/README.md)** · **[Release status](RELEASE_STATUS.md)**

## What it does

- Import PDF, Word, PowerPoint, text and Markdown; use Gemini for flashcards, image OCR and audio transcription.
- Preview, edit, add and remove cards before saving a deck.
- Choose question-and-answer, fill-in-the-blank or multiple-choice cards. Change formats in older decks through Edit deck, without re-uploading material.
- Multiple choice offers four editable options, shuffled review order, answer explanations and a session score. Use 1–4 to select, then Check answer and Continue. Incorrect answers return in one minute.
- Review due cards with Again, Good and Easy scheduling. Space flips; arrows or 1/2/3 rate.
- Track daily activity, streaks and mastery. Export and restore backups.
- Save account data through Google sign-in and Supabase. Explore temporary sample decks without an account.
- Hand-drawn interface, light/dark themes, responsive layouts and reduced-motion support.

## Run locally

Requires **Node.js 24** and npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Sample decks work without credentials; changes in the sample workspace are temporary. To enable accounts and AI, follow [local setup](docs/development.md). Never commit `.env.local` or API secrets.

## Project map

| Path | Purpose |
| --- | --- |
| `app/` | Next.js pages, API routes, auth callbacks and styles |
| `components/` | Dashboard, deck editor, study screen and shared UI |
| `hooks/` | Account loading, autosave and draft recovery |
| `lib/` | Authentication, Gemini, ingestion, validation and scheduling |
| `public/` | Original Ponpon SVGs, icons and licensed local font |
| `supabase/` | Database schema, access rules and rollback-only checks |
| `tests/` | Node tests for core behavior and API boundaries |
| `docs/` | Setup, architecture, design, testing and deployment guides |
| `.github/workflows/` | Automated tests, build and TypeScript checks |

Built with Next.js 16, React 19, TypeScript, Tailwind, Supabase and Google Gemini. The existing architecture and authentication remain in place.

## Validate changes

```bash
npm test
npm run build
npm run typecheck
```

The build creates Next.js generated types, so run it before a clean-checkout typecheck. See [testing](docs/testing.md) for real-account checks and [security](SECURITY.md) for the data-access model. Automated tests do not replace Google sign-in or live-provider testing.
