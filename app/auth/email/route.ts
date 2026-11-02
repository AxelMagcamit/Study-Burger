import {authClient,appOrigin} from '@/lib/auth';
import {verifyMutation,boundedBody,SecurityError,securityResponse,jsonPrivate} from '@/lib/security';
export async function POST(request:Request){
 try{
  verifyMutation(request);
  const body=JSON.parse(new TextDecoder().decode(await boundedBody(request,4096)));
  const {action,email,password}=body;
  if(!['signin','signup','recover','update'].includes(action))throw new SecurityError('Choose a valid sign-in action.');
  if(action!=='update'&&(typeof email!=='string'||email.length>254||!/^\S+@\S+\.\S+$/.test(email)))throw new SecurityError('Enter a valid email address.');
  if(action!=='recover'&&(typeof password!=='string'||password.length>128||password.length<(action==='signin'?1:8)))throw new SecurityError('Use a password with 8–128 characters.');
  const auth=authClient(request);
  let error;
  if(action==='signin')({error}=await auth.client.auth.signInWithPassword({email,password}));
  if(action==='signup')({error}=await auth.client.auth.signUp({email,password,options:{emailRedirectTo:appOrigin()+'/auth/callback'}}));
  if(action==='recover')({error}=await auth.client.auth.resetPasswordForEmail(email,{redirectTo:appOrigin()+'/auth/callback?next=/reset-password'}));
  if(action==='update'){
   if(!await auth.user())throw new SecurityError('Open the recovery link from your email first.',401);
   ({error}=await auth.client.auth.updateUser({password}));
  }
  if(error)return auth.finish(jsonPrivate({error:error.status===429?'Too many attempts. Please wait before trying again.':action==='signin'?'Unable to sign in. Check your email and password, and confirm your email first.':'Unable to complete this request. Please try again later.'},error.status===429?429:400));
  const user=action==='signin'||action==='signup'?await auth.user(true):null;
  return auth.finish(jsonPrivate({redirect:user||action==='update'?'/' :undefined,message:action==='signup'?'Check your email for a confirmation link. Open it in this browser, then sign in.':'If an account exists, a recovery link has been sent. Open it in this browser.'}));
 }catch(error){return securityResponse(error);}
}
