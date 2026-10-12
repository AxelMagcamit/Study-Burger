export class SecurityError extends Error {status:number;constructor(message:string,status=400){super(message);this.status=status;}}
export function requireIdentity<T extends {userId:string}>(user:T|null):T {if(!user?.userId)throw new SecurityError('Sign in to use your study account.',401);return user;}
export function verifyMutation(request:Request){
 const origin=request.headers.get('origin');const site=request.headers.get('sec-fetch-site');
 if(!origin||origin!==new URL(request.url).origin||site==='cross-site')throw new SecurityError('This request could not be verified. Reload the page and try again.',403);
}
export async function boundedBody(request:Request,limit:number){
 const declared=Number(request.headers.get('content-length')||0);if(declared>limit)throw new SecurityError('Request is too large. Please use a smaller file.',413);
 const reader=request.body?.getReader();if(!reader)return new Uint8Array();const chunks:Uint8Array[]=[];let total=0;
 try{while(true){const {value,done}=await reader.read();if(done)break;total+=value.length;if(total>limit){await reader.cancel();throw new SecurityError('Request is too large. Please use a smaller file.',413);}chunks.push(value);}}finally{reader.releaseLock();}
 const body=new Uint8Array(total);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.length;}return body;
}
export function limitSetting(value:string|undefined,fallback:number,max:number){const n=Number(value);return Number.isInteger(n)&&n>0?Math.min(n,max):fallback;}
export const PRIVATE_HEADERS={'Cache-Control':'private, no-store, max-age=0','Vary':'Cookie','X-Content-Type-Options':'nosniff'};
export function jsonPrivate(value:unknown,status=200){return Response.json(value,{status,headers:PRIVATE_HEADERS});}
export function securityResponse(error:unknown){if(error instanceof SecurityError)return jsonPrivate({error:error.message},error.status);return jsonPrivate({error:'Unable to complete this request. Please try again.'},500);}
