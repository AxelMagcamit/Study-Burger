begin;
-- Only inspect the calling user's factors; never expose authenticator secrets.
create or replace function study_private.mfa_satisfied() returns boolean
language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null and (
 coalesce(auth.jwt()->>'aal','aal1')='aal2' or not exists (
 select 1 from auth.mfa_factors where user_id=auth.uid() and status='verified'));
$$;
revoke all on function study_private.mfa_satisfied() from public,anon;
grant execute on function study_private.mfa_satisfied() to authenticated;
create table public.study_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 nickname text not null check(char_length(btrim(nickname)) between 1 and 40),
 avatar text check(avatar is null or (octet_length(avatar)<=65000 and avatar ~ '^data:image/jpeg;base64,/9j/[A-Za-z0-9+/=]+$'))
);
alter table public.study_profiles enable row level security;
revoke all on public.study_profiles from public,anon,authenticated;
grant select,insert,update on public.study_profiles to authenticated;
create policy profile_owner on public.study_profiles to authenticated
 using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy profile_mfa on public.study_profiles as restrictive to authenticated
 using ((select study_private.mfa_satisfied())) with check ((select study_private.mfa_satisfied()));
create policy account_mfa on public.study_accounts as restrictive to authenticated
 using ((select study_private.mfa_satisfied()));
create policy media_mfa on storage.objects as restrictive to authenticated
 using (bucket_id<>'study-media' or (select study_private.mfa_satisfied()))
 with check (bucket_id<>'study-media' or (select study_private.mfa_satisfied()));
-- Existing write RPC is SECURITY DEFINER, so enforce MFA before any operation.
do $patch$
declare definition text;
begin
 definition:=pg_get_functiondef('study_private.operate(text,jsonb)'::regprocedure);
 if position('study_private.mfa_satisfied()' in definition)=0 then
 definition:=replace(definition,
 'if uid is null then raise sqlstate ''PT401'' using message=''Sign in to continue.''; end if;',
 'if uid is null then raise sqlstate ''PT401'' using message=''Sign in to continue.''; end if; if not study_private.mfa_satisfied() then raise sqlstate ''PT403'' using message=''Complete two-factor authentication.''; end if;');
 if position('study_private.mfa_satisfied()' in definition)=0 then raise exception 'MFA patch anchor not found'; end if;
 execute definition;
 end if;
end $patch$;
commit;
