import {authClient} from '@/lib/auth';
import {verifyMutation,boundedBody,jsonPrivate,securityResponse,SecurityError,requireIdentity} from '@/lib/security';
export async function GET(request:Request){const auth=authClient(request);try{requireIdentity(await auth.user(true));const {data,error}=await auth.client.auth.mfa.listFactors();if(error)throw new SecurityError('Could not load security settings.',503);return auth.finish(jsonPrivate({factors:data.totp.map(f=>({id:f.id,friendlyName:f.friendly_name}))}));}catch(e){return auth.finish(securityResponse(e));}}
export async function POST(request:Request){let auth:ReturnType<typeof authClient>|undefined;try{
 verifyMutation(request);auth=authClient(request);const user=requireIdentity(await auth.user(true));
 const {action,factorId,code}=JSON.parse(new TextDecoder().decode(await boundedBody(request,2048)));
 if(action==='enroll'){
  if(user.mfaRequired)throw new SecurityError('Verify your existing authenticator first.',403);
  const {data:factors,error:listError}=await auth.client.auth.mfa.listFactors();if(listError)throw new SecurityError('Could not load authenticators.',503);
  for(const f of factors.all.filter(f=>f.factor_type==='totp'&&f.status==='unverified'))await auth.client.auth.mfa.unenroll({factorId:f.id});
  const {data,error}=await auth.client.auth.mfa.enroll({factorType:'totp',friendlyName:'Study Burger '+Date.now(),issuer:'Study Burger'});
  if(error)throw new SecurityError('Could not start setup. Please retry.',400);
  return auth.finish(jsonPrivate({id:data.id,qr:data.totp.qr_code,secret:data.totp.secret}));
 }
 if(!['verify','remove'].includes(action)||typeof factorId!=='string'||typeof code!=='string'||!/^\d{6}$/.test(code))throw new SecurityError('Enter the six-digit code from your authenticator.');
 const {error}=await auth.client.auth.mfa.challengeAndVerify({factorId,code});
 if(error)throw new SecurityError('The code was invalid or expired. Try the latest code.',400);
 if(action==='remove'){const {error:removeError}=await auth.client.auth.mfa.unenroll({factorId});if(removeError)throw new SecurityError('Could not remove this authenticator.',400);await auth.client.auth.refreshSession();}
 return auth.finish(jsonPrivate({ok:true}));
 }catch(e){const response=securityResponse(e);return auth?auth.finish(response):response;}}
