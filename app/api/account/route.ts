import {z} from 'zod';
import {authRoute} from '@/lib/auth-route';
import {boundedBody,verifyMutation,jsonPrivate,SecurityError} from '@/lib/security';
import {operation} from '@/lib/supabase-store';
import {validateData} from '@/lib/storage';
export async function GET(request:Request){return authRoute(request,async(user,client)=>{
 const {data:row,error}=await client.from('study_accounts').select('data,revision').eq('user_id',user.userId).maybeSingle();
 if(error)throw new SecurityError('Could not load your account. Please retry.',503);
 return jsonPrivate({data:row?.data||null,revision:row?.revision||0});
});}
export async function PUT(request:Request){return authRoute(request,async(_user,client)=>{
 verifyMutation(request);if(!request.headers.get('content-type')?.startsWith('application/json'))throw new SecurityError('Use a JSON request.',415);
 const bytes=await boundedBody(request,2_100_000);let body;try{body=JSON.parse(new TextDecoder().decode(bytes));}catch{throw new SecurityError('Invalid JSON.');}
 const input=z.object({data:z.unknown(),revision:z.number().int().min(0)}).strict().parse(body);
 let data;try{data=validateData(input.data);}catch{throw new SecurityError('Invalid account data.');}
 return jsonPrivate(await operation(client,'save',{data,revision:input.revision}));
});}
