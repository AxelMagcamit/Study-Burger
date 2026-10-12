-- Non-persistent integration test: every fixture and mutation is rolled back.
begin;
select set_config('test.user_a',gen_random_uuid()::text,true);
select set_config('test.user_b',gen_random_uuid()::text,true);
insert into auth.users(id,aud,role,email) values
 (current_setting('test.user_a')::uuid,'authenticated','authenticated','study-test-a@example.invalid'),
 (current_setting('test.user_b')::uuid,'authenticated','authenticated','study-test-b@example.invalid');
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('test.user_a'),true);
do $$
declare value jsonb; lease text; count_rows integer; p text;
begin
 value:=public.study_operation('save','{"data":{"decks":[],"reviews":[],"goal":20},"revision":0}');
 if (value->>'revision')::int<>1 then raise exception 'initial save failed'; end if;
 begin
   perform public.study_operation('save','{"data":{},"revision":0}');
   raise exception 'stale save accepted';
 exception when sqlstate 'PT409' then null; end;
 value:=public.study_operation('save','{"data":{"decks":[],"reviews":[],"goal":30},"revision":1}');
 if (value->>'revision')::int<>2 then raise exception 'revision update failed'; end if;
 lease:=public.study_operation('reserve','{"cost":1}')->>'token';
 perform public.study_operation('release',jsonb_build_object('token',gen_random_uuid()));
 begin
   perform public.study_operation('reserve','{"cost":1}');
   raise exception 'wrong-token release succeeded';
 exception when sqlstate 'PT429' then null; end;
 perform public.study_operation('release',jsonb_build_object('token',lease));
 for i in 1..29 loop
   lease:=public.study_operation('reserve','{"cost":1}')->>'token';
   perform public.study_operation('release',jsonb_build_object('token',lease));
 end loop;
 begin
   perform public.study_operation('reserve','{"cost":1}');
   raise exception 'quota exceeded';
 exception when sqlstate 'PT429' then null; end;
 p:=public.study_operation('upload','{"ext":"png"}')->>'path';
 if not study_private.upload_allowed(p) then raise exception 'owned upload rejected'; end if;
 perform set_config('request.jwt.claim.sub',current_setting('test.user_b'),true);
 select count(*) into count_rows from public.study_accounts;
 if count_rows<>0 then raise exception 'cross-account read allowed'; end if;
 if study_private.upload_allowed(p) then raise exception 'cross-account upload allowed'; end if;
 begin
   insert into public.study_accounts values(current_setting('test.user_a')::uuid,'{}',1,now());
   raise exception 'direct account write allowed';
 exception when insufficient_privilege then null; end;
 begin
   perform 1 from study_private.quotas;
   raise exception 'private quota access allowed';
 exception when insufficient_privilege then null; end;
end $$;
set local role anon;
do $$ begin
 begin
   perform public.study_operation('save','{"data":{},"revision":0}');
   raise exception 'anonymous RPC accepted';
 exception when insufficient_privilege then null; end;
end $$;
rollback;
select 'PASS: ownership, revisions, quota, leases, uploads, private tables, anonymous denial; fixtures rolled back' as result;
