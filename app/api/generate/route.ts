import {apiKey,generationInput,generateCards} from '@/lib/ai';
import {reserveAI} from '@/lib/supabase-store';
import {authRoute} from '@/lib/auth-route';
import {boundedBody,verifyMutation,jsonPrivate,SecurityError} from '@/lib/security';
export async function POST(request:Request){return authRoute(request,async (user,client)=>{let release:(()=>Promise<void>)|undefined;try{verifyMutation(request);apiKey();if(!request.headers.get('content-type')?.startsWith('application/json'))throw new SecurityError('Use a JSON request.',415);const raw=new TextDecoder().decode(await boundedBody(request,100000));let parsed;try{parsed=JSON.parse(raw);}catch{throw new SecurityError('Invalid JSON.');}const input=generationInput.parse(parsed);release=await reserveAI(client,1);return jsonPrivate({cards:await generateCards(input,request.signal)});}finally{if(release)await release().catch(()=>{});}});}
