# Google login for Vercel

The final Vercel production domain has not yet been assigned. Do not configure a guessed domain as final.

1. In Google Auth Platform create a Web application OAuth client. Configure branding and audience for Study Burger, using only openid, email, and profile scopes. If in Testing, add intended Google accounts as test users.
2. Authorized JavaScript origin: the actual production Vercel origin, such as https://YOUR-ASSIGNED-NAME.vercel.app.
3. Authorized redirect URI: https://vrkygytugewkxsbyzluy.supabase.co/auth/v1/callback.
4. In Supabase Authentication → Sign In / Providers → Google, enable Google and enter the client ID/secret. Keep nonce verification enabled. Do not paste the secret in chat or commit it.
5. In Supabase URL Configuration, set Site URL to the actual Vercel origin and allow that origin followed by /auth/callback. No production wildcards. Retain the older Sites callback only while the old site is intentionally supported.
6. In Vercel set APP_URL to the exact production origin, SUPABASE_URL to https://vrkygytugewkxsbyzluy.supabase.co, SUPABASE_PUBLISHABLE_KEY to its enabled publishable key, and GOOGLE_AUTH_ENABLED=true. Redeploy.
7. Verify Google login, deck save/reload, logout, isolation between two Google accounts, and stale-save handling between two tabs.

Local development uses APP_URL=http://localhost:3000 and the Supabase allowlisted callback http://localhost:3000/auth/callback.

Reference: https://supabase.com/docs/guides/auth/social-login/auth-google
