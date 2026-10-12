import {createServerClient,parseCookieHeader,serializeCookieHeader,type CookieOptions} from '@supabase/ssr';
import {SecurityError,PRIVATE_HEADERS} from './security';
export type AccountUser={userId:string;displayName:string;email:string};
export function authConfigured(){return !!(process.env.SUPABASE_URL&&process.env.SUPABASE_PUBLISHABLE_KEY&&process.env.APP_URL&&process.env.GOOGLE_AUTH_ENABLED==='true');}
export function appOrigin(){const raw=process.env.APP_URL;if(!raw)throw new SecurityError('Google sign-in is being set up. You can explore the sample workspace.',503);const url=new URL(raw);if(url.protocol!=='https:'&&url.hostname!=='localhost'&&url.hostname!=='127.0.0.1')throw new SecurityError('Sign-in configuration is unavailable.',503);return url.origin;}
export function authClient(request:Request){
 if(!authConfigured())throw new SecurityError('Google sign-in is being set up. You can explore the sample workspace.',503);
 const changes:{name:string;value:string;options:CookieOptions}[]=[];
 const secure=appOrigin().startsWith('https:');
 const client=createServerClient(process.env.SUPABASE_URL!,process.env.SUPABASE_PUBLISHABLE_KEY!,{
  cookieOptions:{path:'/',httpOnly:true,sameSite:'lax',secure},
  cookies:{getAll:()=>parseCookieHeader(request.headers.get('cookie')||'').map(c=>({name:c.name,value:c.value||''})),setAll:cookies=>{changes.push(...cookies);}}
 });
 function finish(response:Response){const headers=new Headers(response.headers);for(const [name,value] of Object.entries(PRIVATE_HEADERS))headers.set(name,value);for(const c of changes)headers.append('Set-Cookie',serializeCookieHeader(c.name,c.value,{...c.options,path:'/',httpOnly:true,sameSite:'lax',secure}));return new Response(response.body,{status:response.status,headers});}
 async function user():Promise<AccountUser|null>{const {data,error}=await client.auth.getUser();if(error||!data.user)return null;const u=data.user;if(!u.identities?.some(i=>i.provider==='google')||!u.email_confirmed_at)return null;return {userId:u.id,email:u.email||'',displayName:typeof u.user_metadata.full_name==='string'?u.user_metadata.full_name:u.email?.split('@')[0]||'Learner'};}
 return {client,finish,user};
}
