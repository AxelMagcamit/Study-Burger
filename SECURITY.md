# Security model

- Google OAuth through Supabase with PKCE and HttpOnly, Secure, SameSite=Lax cookies. Server routes verify identities with getUser.
- Account reads enforce owner-only Postgres RLS. Anonymous users have no table or RPC grants. Direct writes are revoked; the private mutation function derives identity from auth.uid(), never a client-supplied user ID.
- Revision-checked saves prevent lost updates. The database caps stored JSON at 2 MB.
- Quotas and AI leases are private tables with no client table grants. SECURITY DEFINER logic is in study_private, uses an empty search_path, checks auth.uid(), and exposes only bounded operations through an invoker wrapper. No arbitrary SQL, user IDs, or limit values are accepted.
- Storage uses a private 20 MB bucket. Upload authorizations are bounded and tied to a generated path and authenticated owner. Reads/deletes check the owner path. Processing deletes uploaded media even on most errors; abandoned uploads are cleaned on a later upload. No service-role key is used.
- Mutating app endpoints enforce same-origin requests, bounded streamed bodies, and validated data. AI inputs are untrusted; structured output is validated.
- Next.js headers provide CSP, nosniff, HSTS, frame denial, and no-store on auth/account routes. CSP currently allows inline scripts/styles for hydration; it is not a strict nonce policy.

## Verified

supabase/verify-security.sql checks ownership, revision conflicts, quota exhaustion, lease tokens, upload ownership, private-table denial, and anonymous RPC denial. All fixtures roll back. Supabase advisors reported only informational notices for deliberately deny-all private tables without RLS policies.

## Operational limits

No absolute-security claim. The operator/provider can access stored data; this is not end-to-end encryption. Complete Google consent configuration and actual multi-account login tests before inviting users. Set provider budget controls before enabling AI. Admins should remove abandoned media for users who do not return, and clean expired upload authorization rows periodically. Account deletion must remove stored media through the Storage API before deleting the authentication account; database content cascades on auth-user deletion. Never delete Storage metadata directly with SQL.
