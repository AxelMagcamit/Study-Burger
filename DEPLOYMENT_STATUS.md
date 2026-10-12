# Deployment checkpoint

Updated 2026-10-12 for Axel Magcamit.

## Production

- URL: https://study-burger-ponpon.vercel.app
- Vercel status: READY; target production; region hnd1; Next.js / Node 24.
- Project: prj_oHCBziGESkSd6aQguc9zMUX8dGIG; team: team_V97eEbdEhUlHykiiNxfqC0IW (ponpon2).
- Deployment: dpl_HJNedJyWogofjZbQMjjZBYphKFbu.
- Source commit: 434b2f78c50a0b8e3abee60e1f06a9b6e5151d13, https://github.com/AxelMagcamit/Study-Burger.
- Public access configured: Vercel SSO/password/IP protection disabled on this project.
- APP_URL, Supabase URL/publishable key, Google-disabled flag, and quota configuration saved for production.
- Original Sites publication remains unchanged: https://study-burger.crispbook.chatgpt.site.

## Resolution

The exact project was accessible when optional teamId was omitted and the credential’s existing scope was used. Returned accountId matched the intended team. Explicit teamId requests failed with 403. Project configuration, environment creation, and deployment now succeed. Some log/protected-fetch endpoints still return 403, so connector access is not universally repaired.

Git import failed with git_info_fail. Uploading the identical 122 committed source files directly succeeded. Automatic deployment on future GitHub pushes is not verified.

Vercel confirms READY and the Ponpon alias points to this deployment. Independent HTTP verification was blocked by the execution environment’s proxy; connector web-fetch failed while reading protection-bypass metadata. End-to-end browser verification remains pending.

## Completed checks

- Production build and 11 Node tests passed before upload.
- Supabase rollback-only ownership, revision, quota, and authorization tests passed.
- Supabase migration study_burger_accounts_and_media already applied to vrkygytugewkxsbyzluy; do not reapply.

## Remaining configuration

- Configure Google provider in Supabase and allow https://study-burger-ponpon.vercel.app/auth/callback; set GOOGLE_AUTH_ENABLED=true only after configuration.
- Google provider callback: https://vrkygytugewkxsbyzluy.supabase.co/auth/v1/callback.
- Configure OPENAI_API_KEY securely in Vercel, then redeploy.
- Verify login/logout, two-account isolation, upload, generation, and study flows in the browser.
- Google sign-in and AI remain disabled until provider setup. No credentials are committed.
