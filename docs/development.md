# Local development

1. Clone `https://github.com/AxelMagcamit/Study-Burger.git` and enter the directory.
2. Install Node.js 24, then run `npm ci`.
3. Copy `.env.example` to `.env.local`. Keep it untracked.
4. Run `npm run dev`, then open http://localhost:3000.
5. Use **Explore sample decks** to work without external services. Sample changes do not survive reload; export a backup to retain them.

## Enable accounts

Use a separate Supabase project for development when possible. Apply `supabase/schema.sql` once to a new project. **The connected production project already has its schema; do not replay it there.**

Set `APP_URL=http://localhost:3000`, `SUPABASE_URL`, and `SUPABASE_PUBLISHABLE_KEY`. Complete [Google setup](google-auth.md), allow the exact local `/auth/callback` URL, then set `GOOGLE_AUTH_ENABLED=true`. There is no separate email/password account system.

## Enable AI

Set server-only `GEMINI_API_KEY` and `GEMINI_MODEL` as described in [Gemini setup](gemini.md). Never prefix secrets with `NEXT_PUBLIC_`. Restart the dev server after changing environment variables. Provider quotas and model access depend on the Google project.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm test` | Node behavior and API tests |
| `npm run build` | Production build, including generated route types |
| `npm run typecheck` | TypeScript validation |
| `npm start` | Serve an existing production build |

The install script copies the PDF.js worker into `public/`. Do not manually edit generated worker or `.next` files. Keep the lockfile with dependency changes.

## Small, reviewable changes

Keep scheduling in `lib/study.ts`, authorization in server routes and database rules, and visual changes in the design layer. Preserve keyboard controls, reduced motion, original Ponpon assets and the production domain. Run the validation commands before publishing. Follow [testing](testing.md) for behavior that requires real accounts.
