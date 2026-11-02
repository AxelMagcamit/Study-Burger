import {test} from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {existsSync} from 'node:fs';
registerHooks({resolve(specifier,context,next){
 if(specifier.startsWith('@/'))return next(new URL('../'+specifier.slice(2)+'.ts',import.meta.url).href,context);
 if(specifier.startsWith('.')&&!specifier.endsWith('.ts')&&context.parentURL){const url=new URL(specifier+'.ts',context.parentURL);if(existsSync(url))return next(url.href,context);}
 return next(specifier,context);
}});
const auth=await import('../lib/auth.ts');
const session=await import('../app/api/session/route.ts');
const google=await import('../app/auth/google/route.ts');
const callback=await import('../app/auth/callback/route.ts');
const account=await import('../app/api/account/route.ts');
const origin='https://study-burger.vercel.app';
process.env.APP_URL=origin;process.env.SUPABASE_URL='https://auth.example.test';process.env.SUPABASE_PUBLISHABLE_KEY='test-publishable-placeholder';
test('Missing provider setup returns an explicit unavailable session',async()=>{const saved=process.env.SUPABASE_URL;delete process.env.SUPABASE_URL;const r=await session.GET(new Request(origin+'/api/session'));process.env.SUPABASE_URL=saved;assert.deepEqual(await r.json(),{configured:false,user:null});assert.match(r.headers.get('cache-control')!,/no-store/);});
test('Anonymous callers cannot load another user’s study data',async()=>{process.env.GOOGLE_AUTH_ENABLED='true';const r=await account.GET(new Request(origin+'/api/account'));assert.equal(r.status,401);assert.match(r.headers.get('cache-control')!,/no-store/);});
test('OAuth initiation requires same-origin POST and issues secure PKCE cookies',async()=>{process.env.GOOGLE_AUTH_ENABLED='true';const rejected=await google.POST(new Request(origin+'/auth/google',{method:'POST',headers:{origin:'https://other.example'}}));assert.equal(rejected.status,403);const r=await google.POST(new Request(origin+'/auth/google',{method:'POST',headers:{origin,accept:'application/json'}}));assert.equal(r.status,200);const url=new URL((await r.json()).url);assert.equal(url.origin,'https://auth.example.test');assert.equal(url.searchParams.get('provider'),'google');assert.equal(url.searchParams.get('redirect_to'),origin+'/auth/callback');assert.ok(url.searchParams.get('code_challenge'));assert.equal(url.searchParams.get('code_challenge_method'),'s256');const cookies=r.headers.getSetCookie().join(';');assert.match(cookies,/HttpOnly/i);assert.match(cookies,/Secure/i);assert.match(cookies,/SameSite=Lax/i);});
test('Cancelled OAuth returns to a fixed application URL',async()=>{const r=await callback.GET(new Request(origin+'/auth/callback?next=https://evil.example'));assert.equal(r.status,303);assert.equal(r.headers.get('location'),origin+'/?auth_error=cancelled');});
test('Native sign-in form redirects to Google authorization with PKCE cookies',async()=>{process.env.GOOGLE_AUTH_ENABLED='true';const r=await google.POST(new Request(origin+'/auth/google',{method:'POST',headers:{origin,accept:'text/html','sec-fetch-site':'same-origin'}}));assert.equal(r.status,303);const url=new URL(r.headers.get('location')!);assert.equal(url.origin,'https://auth.example.test');assert.equal(url.searchParams.get('provider'),'google');assert.equal(url.searchParams.get('redirect_to'),origin+'/auth/callback');assert.ok(url.searchParams.get('code_challenge'));assert.match(r.headers.getSetCookie().join(';'),/HttpOnly/i);assert.match(r.headers.get('cache-control')!,/no-store/);});
test('User metadata cannot grant account access without a verified supported identity',async()=>{const a=auth.authClient(new Request(origin));const user={id:'a',email:'a@example.test',email_confirmed_at:'2026-01-01',user_metadata:{provider:'google',full_name:'Test'},identities:[{provider:'phone'}]};a.client.auth.getUser=async()=>({data:{user},error:null}) as never;assert.equal(await a.user(),null);user.identities=[{provider:'google'}];assert.equal((await a.user())?.userId,'a');user.identities=[{provider:'email'}];assert.equal((await a.user())?.userId,'a');user.email_confirmed_at='';assert.equal(await a.user(),null);});
test('Auth service outages are not misreported as an anonymous user',async()=>{const a=auth.authClient(new Request(origin));a.client.auth.getUser=async()=>({data:{user:null},error:{name:'AuthRetryableFetchError',status:503}}) as never;await assert.rejects(()=>a.user(),/unavailable/);});
const emailAuth=await import('../app/auth/email/route.ts');
test('Email authentication rejects cross-origin requests and invalid passwords',async()=>{
 const cross=await emailAuth.POST(new Request(origin+'/auth/email',{method:'POST',headers:{origin:'https://evil.example'},body:'{}'}));assert.equal(cross.status,403);
 const short=await emailAuth.POST(new Request(origin+'/auth/email',{method:'POST',headers:{origin},body:JSON.stringify({action:'signup',email:'a@example.test',password:'short'})}));assert.equal(short.status,400);
 const reset=await emailAuth.POST(new Request(origin+'/auth/email',{method:'POST',headers:{origin},body:JSON.stringify({action:'update',password:'new-password-example'})}));assert.equal(reset.status,401);
});
test('Verified MFA factors block account access until AAL2, while login can show a challenge',async()=>{
 const a=auth.authClient(new Request(origin));
 const user={id:'a',email:'a@example.test',email_confirmed_at:'2026-01-01',user_metadata:{},identities:[{provider:'email'}],factors:[{status:'verified',factor_type:'totp'}]};
 a.client.auth.getUser=async()=>({data:{user},error:null}) as never;
 a.client.auth.mfa.getAuthenticatorAssuranceLevel=async()=>({data:{currentLevel:'aal1',nextLevel:'aal2'},error:null}) as never;
 await assert.rejects(()=>a.user(),/two-factor/);assert.equal((await a.user(true))?.mfaRequired,true);
 a.client.auth.mfa.getAuthenticatorAssuranceLevel=async()=>({data:{currentLevel:'aal2',nextLevel:'aal2'},error:null}) as never;
 assert.equal((await a.user())?.mfaRequired,false);
 user.factors[0].status='unverified';a.client.auth.mfa.getAuthenticatorAssuranceLevel=async()=>{throw Error('Should not require unfinished enrollment');};assert.equal((await a.user())?.mfaRequired,false);
});
