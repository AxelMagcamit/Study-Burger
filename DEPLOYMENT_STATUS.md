# Deployment checkpoint

Prepared on 2026-10-12 for Axel Magcamit.

## Target

- Existing public site (unchanged): https://study-burger.crispbook.chatgpt.site
- User requested Vercel hosting and a vercel.app domain, retaining Ponpon UI.
- Vercel project created: prj_oHCBziGESkSd6aQguc9zMUX8dGIG (study-burger).
- Its returned account ID: team_V97eEbdEhUlHykiiNxfqC0IW, scope ponpon2.
- Assigning study-burger.vercel.app returned HTTP 403: the connected credential is not authorized for ponpon2. Domain availability and assignment are unconfirmed. Do not retry under a different default scope to bypass this restriction.
- No Vercel deployment or Vercel environment-variable configuration was attempted after this denial. No authenticated Vercel CLI is available locally.

## Completed

- Standard Next.js 16 / Node 24 build, npm lockfile, Vercel Tokyo config, security headers.
- Supabase RLS-protected account storage and revision-aware save RPC.
- Private atomic quota/lease functions and signed private media uploads, supporting 20 MB files without proxying upload bytes through a Vercel Function.
- Supabase migration study_burger_accounts_and_media applied to vrkygytugewkxsbyzluy. Do not reapply schema.sql there.
- Rollback-only SQL integration tests passed. Security advisors returned only expected informational deny-all private-table notices.
- Node tests (11) and production build passed. No browser/end-to-end Google, media, or OpenAI verification yet.
- Original Sites source/main and public deployment remain unchanged.

## Next actions

1. Resolve authorized Vercel access to this exact project/team; do not create duplicate projects.
2. Assign an available vercel.app production alias and configure SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, APP_URL, GOOGLE_AUTH_ENABLED (false until provider setup), and OPENAI_API_KEY when available.
3. Deploy reviewed source via Vercel file API or connected GitHub repo. GitHub source repository: https://github.com/AxelMagcamit/Study-Burger.git (main).
4. Update Google origin and Supabase callback allowlist for the actual Vercel domain. Google OAuth callback remains https://vrkygytugewkxsbyzluy.supabase.co/auth/v1/callback.
5. Set public production access for this project, verify login and two-account isolation, test media/AI, and only then report the new domain as live.

This archive contains no credentials. Supabase's publishable key can be fetched again through the connected project; Google secrets and OpenAI keys must be configured securely by the owner.
