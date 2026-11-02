import {authRoute} from '@/lib/auth-route';
import {verifyMutation,boundedBody,jsonPrivate,SecurityError} from '@/lib/security';
export async function GET(request:Request){return authRoute(request,async(user,client)=>{const {data,error}=await client.from('study_profiles').select('nickname,avatar').eq('user_id',user.userId).maybeSingle();if(error)throw new SecurityError('Could not load your profile.',503);return jsonPrivate({nickname:data?.nickname||user.displayName,avatar:data?.avatar||null});});}
export async function PUT(request:Request){return authRoute(request,async(user,client)=>{
 verifyMutation(request);const body=JSON.parse(new TextDecoder().decode(await boundedBody(request,70000)));
 if(typeof body.nickname!=='string'||!body.nickname.trim()||body.nickname.trim().length>40)throw new SecurityError('Use a nickname between 1 and 40 characters.');
 const avatar=body.avatar;
 if(avatar!==null&&(typeof avatar!=='string'||avatar.length>65000||!/^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/=]+$/.test(avatar)))throw new SecurityError('Choose a valid profile photo.');
 const profile={nickname:body.nickname.trim(),avatar};
 const {error}=await client.from('study_profiles').upsert({user_id:user.userId,...profile});if(error)throw new SecurityError('Could not save your profile. Please retry.',503);
 return jsonPrivate(profile);
});}
