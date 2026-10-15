import {authRoute} from '@/lib/auth-route';
import {reserveAI} from '@/lib/supabase-store';
import {boundedBody,verifyMutation,SecurityError,jsonPrivate} from '@/lib/security';
import {z} from 'zod';
import {APIError,apiKey,extractMedia} from '@/lib/ai';
import {MAX_MEDIA_BYTES} from '@/lib/upload-limits';
export async function POST(request:Request){return authRoute(request,async (user,client)=>{let storedPath:string|undefined;let release:(()=>Promise<void>)|undefined;try{
 verifyMutation(request);apiKey();
 const raw=await boundedBody(request,2000);const {path}=z.object({path:z.string().max(200)}).strict().parse(JSON.parse(new TextDecoder().decode(raw)));
 const parts=path.split('/');
 if(parts.length!==2||parts[0]!==user.userId||!/^[a-f0-9-]{36}\.(png|jpg|jpeg|mp3|mp4|mpeg|mpga|m4a|wav|webm)$/.test(parts[1]))throw new SecurityError('Invalid media path.',403);
 storedPath=path;
 const {data:blob,error}=await client.storage.from('study-media').download(path);
 if(error||!blob)throw new SecurityError('Upload not found. Please upload the file again.',404);
 if(!blob.size||blob.size>MAX_MEDIA_BYTES)throw new SecurityError('Upload a nonempty file up to 50 MB.',413);
 const file=new File([blob],path.split('/').at(-1)!,{type:blob.type});
 const ext=file.name.split('.').pop()?.toLowerCase();
 if(['png','jpg','jpeg'].includes(ext||'')){
 const bytes=new Uint8Array(await file.arrayBuffer());const png=bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71;const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;if(!png&&!jpg)throw new APIError('The file is not a valid PNG or JPEG.');
 release=await reserveAI(client,2);
 return jsonPrivate({text:await extractMedia(bytes,png?'image/png':'image/jpeg',request.signal)});
 }
 if(!['mp3','mp4','mpeg','mpga','m4a','wav','webm'].includes(ext||''))throw new APIError('Unsupported media format.');
 release=await reserveAI(client,5);
 const mimeTypes:Record<string,string>={mp3:'audio/mp3',mp4:'video/mp4',mpeg:'audio/mpeg',mpga:'audio/mpeg',m4a:'audio/m4a',wav:'audio/wav',webm:'audio/webm'};
 return jsonPrivate({text:await extractMedia(new Uint8Array(await file.arrayBuffer()),mimeTypes[ext!],request.signal)});
 }finally{if(storedPath)await client.storage.from('study-media').remove([storedPath]).catch(()=>{});if(release)await release().catch(()=>{});}});}
