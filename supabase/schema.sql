-- Study Burger / PostgreSQL. Apply once to the selected Supabase project.
create schema if not exists study_private;
revoke all on schema study_private from public, anon;
grant usage on schema study_private to authenticated;

create table public.study_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null check (octet_length(data::text) <= 2000000),
  revision bigint not null check (revision > 0),
  updated_at timestamptz not null default now()
);
alter table public.study_accounts enable row level security;
revoke all on public.study_accounts from public, anon, authenticated;
grant select on public.study_accounts to authenticated;
create policy owner_read on public.study_accounts for select to authenticated using ((select auth.uid()) = user_id);

create table study_private.quotas (key text primary key, used integer not null, expires_at timestamptz not null);
create index quotas_expiry on study_private.quotas(expires_at);
create table study_private.jobs (user_id uuid primary key references auth.users(id) on delete cascade, token uuid not null, expires_at timestamptz not null);
create table study_private.uploads (path text primary key, user_id uuid not null references auth.users(id) on delete cascade, expires_at timestamptz not null);
create index uploads_user on study_private.uploads(user_id);
alter table study_private.quotas enable row level security;
alter table study_private.jobs enable row level security;
alter table study_private.uploads enable row level security;
revoke all on all tables in schema study_private from public, anon, authenticated;

-- Called only by the private, authenticated operation below. All mutations run
-- in one transaction: quota/lease changes roll back together on failure.
create function study_private.take_quota(k text, amount integer, maximum integer, expiry timestamptz) returns void
language plpgsql set search_path = '' as $$
declare count_now integer;
begin
  insert into study_private.quotas as q values(k, amount, expiry)
  on conflict(key) do update set used=q.used+excluded.used where q.used+excluded.used<=maximum
  returning used into count_now;
  if count_now is null or count_now>maximum then raise sqlstate 'PT429' using message='Usage limit reached. Try again after the limit resets.'; end if;
end $$;
revoke all on function study_private.take_quota(text,integer,integer,timestamptz) from public,anon,authenticated;

create function study_private.operate(operation text, payload jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid(); result_revision bigint; claim uuid; expected bigint;
  epoch_day text := floor(extract(epoch from now())/86400)::text;
  epoch_hour text := floor(extract(epoch from now())/3600)::text;
  day_end timestamptz := to_timestamp((floor(extract(epoch from now())/86400)+1)*86400);
  cost integer; object_path text;
begin
  if uid is null then raise sqlstate 'PT401' using message='Sign in to continue.'; end if;
  if operation='save' then
    perform study_private.take_quota('save:'||uid||':'||epoch_hour,1,1000,now()+interval '1 hour');
    expected := (payload->>'revision')::bigint;
    if expected < 0 or expected is null or jsonb_typeof(payload->'data') is distinct from 'object' then raise sqlstate 'PT400' using message='Invalid account data.'; end if;
    if octet_length((payload->'data')::text)>2000000 then raise sqlstate 'PT413' using message='Account storage limit is 2 MB.'; end if;
    if expected=0 then
      insert into public.study_accounts values(uid,payload->'data',1,now()) on conflict(user_id) do nothing returning revision into result_revision;
    else
      update public.study_accounts set data=payload->'data',revision=revision+1,updated_at=now() where user_id=uid and revision=expected returning revision into result_revision;
    end if;
    if result_revision is null then raise sqlstate 'PT409' using message='This account changed in another tab. Export your unsaved work, then reload.'; end if;
    return jsonb_build_object('revision',result_revision);
  elsif operation='reserve' then
    cost := (payload->>'cost')::integer;
    if cost is null or cost not in (1,2,5) then raise sqlstate 'PT400' using message='Invalid request cost.'; end if;
    claim := gen_random_uuid();
    insert into study_private.jobs as j values(uid,claim,now()+interval '3 minutes')
    on conflict(user_id) do update set token=excluded.token,expires_at=excluded.expires_at where j.expires_at<now()
    returning token into claim;
    if claim is null then raise sqlstate 'PT429' using message='An AI request is already running. Please wait.'; end if;
    perform study_private.take_quota('ai:'||uid||':'||epoch_day,cost,30,day_end);
    perform study_private.take_quota('global:'||epoch_day,cost,300,day_end);
    delete from study_private.quotas where key in (select key from study_private.quotas where expires_at<now()-interval '1 day' limit 100);
    return jsonb_build_object('token',claim);
  elsif operation='release' then
    delete from study_private.jobs where user_id=uid and token=(payload->>'token')::uuid;
    return '{}'::jsonb;
  elsif operation='upload' then
    perform study_private.take_quota('upload:'||uid||':'||epoch_day,1,30,day_end);
    if (payload->>'ext') is null or (payload->>'ext') !~ '^(png|jpg|jpeg|mp3|mp4|mpeg|mpga|m4a|wav|webm)$' then raise sqlstate 'PT400' using message='Unsupported media format.'; end if;
    object_path:=uid||'/'||gen_random_uuid()||'.'||(payload->>'ext');
    insert into study_private.uploads values(object_path,uid,now()+interval '2 hours');
    return jsonb_build_object('path',object_path);
  else
    raise sqlstate 'PT400' using message='Unknown operation.';
  end if;
end $$;
revoke all on function study_private.operate(text,jsonb) from public,anon;
grant execute on function study_private.operate(text,jsonb) to authenticated;
-- Exposed wrapper is SECURITY INVOKER; privileged code stays in private schema.
create function public.study_operation(operation text,payload jsonb) returns jsonb
language sql security invoker set search_path='' as $$ select study_private.operate(operation,payload) $$;
revoke all on function public.study_operation(text,jsonb) from public,anon;
grant execute on function public.study_operation(text,jsonb) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit) values('study-media','study-media',false,20971520);
create function study_private.upload_allowed(object_path text) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from study_private.uploads where path=object_path and user_id=auth.uid() and expires_at>now())
$$;
revoke all on function study_private.upload_allowed(text) from public,anon;
grant execute on function study_private.upload_allowed(text) to authenticated;
create policy study_media_insert on storage.objects for insert to authenticated with check(bucket_id='study-media' and study_private.upload_allowed(name));
create policy study_media_read on storage.objects for select to authenticated using(bucket_id='study-media' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy study_media_delete on storage.objects for delete to authenticated using(bucket_id='study-media' and (storage.foldername(name))[1]=(select auth.uid())::text);
