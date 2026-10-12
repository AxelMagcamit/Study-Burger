# Production deployment

Use the existing project. Do not create another domain or project.

| Setting | Value |
| --- | --- |
| URL / `APP_URL` | `https://study-burger.vercel.app` |
| Vercel project | `prj_oHCBziGESkSd6aQguc9zMUX8dGIG` (`study-burger`) |
| Team | `team_V97eEbdEhUlHykiiNxfqC0IW` (`ponpon2`) |
| Supabase | `vrkygytugewkxsbyzluy` |
| Runtime | Next.js, Node.js 24, region `hnd1` |
| Install / build | `npm ci` / `npm run build` |

## Release

1. Run tests, production build and typecheck; review [manual checks](testing.md).
2. Commit the exact source to GitHub `main`.
3. Deploy that source to the existing Vercel project. Automatic GitHub deployment has not been verified; a push alone is not evidence of a deployment.
4. Wait for the deployment's terminal **READY** state.
5. Confirm the primary alias points to that deployment. Check the homepage, privacy page, font and application workflows.
6. Record verified checks and remaining limitations in [release status](../RELEASE_STATUS.md).

Keep the existing redirects from `study-burger-ponpon.vercel.app` and `study-burger-ponpon2.vercel.app`. Do not change OAuth redirect origins during a visual release.

## Environment

Production already has Google enabled and a Gemini secret configured. Values are managed in [Vercel environment settings](https://vercel.com/ponpon2/study-burger/settings/environment-variables). `.env.example` lists application variable names. Keep secret values out of chat, logs, GitHub and `NEXT_PUBLIC_` variables. Environment changes require a new deployment.

Google registration and login share one flow. Google handles password recovery. See [Google auth](google-auth.md) and [Gemini](gemini.md) for setup details.

## Connector access notes

Exact project-ID requests with the connector's inferred scope have worked. Explicit `teamId`, some log access and protected-fetch metadata returned 403. Do not attempt to bypass denied access. Direct source-file deployments have worked; the earlier Git import returned `git_info_fail`.

## Rollback

In the existing project's Deployments view, select the last known-good production deployment and use Vercel's rollback/promote action. Confirm READY and the primary alias afterward. A visual-only release does not require a database migration. Revert the corresponding GitHub commit separately so the next release does not restore the reverted change.
