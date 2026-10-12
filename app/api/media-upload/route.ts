import {z} from 'zod';
import {authRoute} from '@/lib/auth-route';
import {apiKey} from '@/lib/ai';
import {operation} from '@/lib/supabase-store';
import {boundedBody,verifyMutation,jsonPrivate,SecurityError} from '@/lib/security';
export async function POST(request:Request){return authRoute(request,async(_user,client)=>{
  verifyMutation(request);apiKey();
  const bytes=await boundedBody(request,2000);
  const {ext,size}=z.object({ext:z.enum(['png','jpg','jpeg','mp3','mp4','mpeg','mpga','m4a','wav','webm']),size:z.number().int().min(1).max(20*1024*1024)}).strict().parse(JSON.parse(new TextDecoder().decode(bytes)));
  const {path}=await operation(client,'upload',{ext});
  // Clear abandoned uploads from earlier sessions through the Storage API.
  const {data:old}=await client.storage.from('study-media').list(_user.userId,{limit:100});
  const expired=(old||[]).filter(o=>o.created_at && Date.parse(o.created_at)<Date.now()-86400000).map(o=>`${_user.userId}/${o.name}`);
  if(expired.length)await client.storage.from('study-media').remove(expired);
  const {data,error}=await client.storage.from('study-media').createSignedUploadUrl(String(path));
  if(error||!data)throw new SecurityError('Could not prepare your upload. Please retry.',503);
  return jsonPrivate({path:data.path,signedUrl:data.signedUrl,size});
});}
