import {test} from 'node:test';
import assert from 'node:assert/strict';
import {gemini,extractMedia,APIError} from '../lib/ai.ts';
import {pause,retryDelay} from '../lib/ai-retry.ts';
import {MAX_DOCUMENT_BYTES,MAX_MEDIA_BYTES,INLINE_MEDIA_BYTES} from '../lib/upload-limits.ts';

const reply=()=>Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:'A useful transcript.'}]}}]});
async function fixture(run:()=>Promise<void>){
 const original=globalThis.fetch;const key=process.env.GEMINI_API_KEY;const model=process.env.GEMINI_MODEL;
 process.env.GEMINI_API_KEY='test-only';process.env.GEMINI_MODEL='gemini-3.8-flash';
 try{await run();}finally{globalThis.fetch=original;if(key===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=key;if(model===undefined)delete process.env.GEMINI_MODEL;else process.env.GEMINI_MODEL=model;}
}
test('Temporary overload retries and then uses the fallback with the same source',async()=>fixture(async()=>{
 const calls:string[]=[];
 globalThis.fetch=async(url,options)=>{
  calls.push(String(url));const body=JSON.parse(String(options?.body));assert.equal(body.contents[0].parts[0].text,'Source text');
  return calls.length<3?Response.json({}, {status:503}):reply();
 };
 await gemini('Instructions',[{text:'Source text'}]);
 assert.equal(calls.length,3);assert.match(calls[1],/gemini-3.8-flash/);assert.match(calls[2],/gemini-3.5-flash-lite/);
}));
test('Daily exhaustion, credentials and long cooldowns do not spin or rotate models',async()=>fixture(async()=>{
 for(const response of [
  Response.json({error:{details:[{violations:[{quotaId:'GenerateRequestsPerDayPerProjectPerModel-FreeTier'}]}]}},{status:429}),
  Response.json({}, {status:429,headers:{'Retry-After':'60'}}),
  Response.json({}, {status:403}),Response.json({}, {status:400})
 ]){
  let calls=0;globalThis.fetch=async()=>{calls++;return response;};
  await assert.rejects(()=>gemini('test',[{text:'source'}]),APIError);assert.equal(calls,1);
 }
}));
test('Rate-limit delays honor provider headers/details and cancellation interrupts backoff',async()=>{
 assert.ok(retryDelay(new Headers({'Retry-After':'5'}),{},0)!>=5000);
 assert.ok(retryDelay(new Headers(),{error:{details:[{retryDelay:'3s'}]}},0)!>=3000);
 assert.equal(retryDelay(new Headers({'Retry-After':'120'}),{},0),null);
 const controller=new AbortController();const pending=pause(10000,controller.signal);controller.abort();await assert.rejects(()=>pending,{name:'AbortError'});
});
test('Cancel after a busy response prevents every subsequent attempt',async()=>fixture(async()=>{
 const controller=new AbortController();let calls=0;
 globalThis.fetch=async()=>{calls++;controller.abort();return Response.json({}, {status:503});};
 await assert.rejects(()=>gemini('test',[{text:'source'}],controller.signal),{name:'AbortError'});assert.equal(calls,1);
}));
test('Large media uploads through Files API and deletes Google file on success/failure/cancel',async()=>fixture(async()=>{
 for(const outcome of ['success','failure','cancel']){
  const controller=new AbortController();let deleted=false;let generated=false;
  globalThis.fetch=async(url,options)=>{
   const target=String(url);
   if(options?.method==='DELETE'){assert.equal(options.signal?.aborted,false);deleted=true;return new Response(null,{status:200});}
   if(target.endsWith('/upload/v1beta/files'))return new Response(null,{headers:{'x-goog-upload-url':'https://generativelanguage.googleapis.com/upload/test'}});
   if(target.endsWith('/upload/test')){
    assert.equal((options?.body as Buffer).length,INLINE_MEDIA_BYTES+1);
    if(outcome==='cancel')controller.abort();
    return Response.json({file:{name:'files/test',uri:'https://generativelanguage.googleapis.com/v1beta/files/test',state:outcome==='failure'?'FAILED':'ACTIVE'}});
   }
   assert.match(target,/:generateContent$/);generated=true;
   const body=JSON.parse(String(options?.body));assert.ok(body.contents[0].parts[0].fileData);assert.equal(body.contents[0].parts[0].inlineData,undefined);
   return reply();
  };
  const run=()=>extractMedia(new Uint8Array(INLINE_MEDIA_BYTES+1),'audio/mpeg',controller.signal);
  if(outcome==='success')assert.equal(await run(),'A useful transcript.');else await assert.rejects(run);
  assert.equal(deleted,true);assert.equal(generated,outcome==='success');
 }
}));
test('Large upload accepts the exact media boundary and rejects above it before provider access',async()=>fixture(async()=>{
 assert.equal(MAX_DOCUMENT_BYTES,100*1024*1024);assert.equal(MAX_MEDIA_BYTES,50*1024*1024);
 let calls=0;globalThis.fetch=async()=>{calls++;throw new Error('Provider reached');};
 await assert.rejects(()=>extractMedia(new Uint8Array(MAX_MEDIA_BYTES),'audio/mpeg',new AbortController().signal),/Provider reached/);assert.equal(calls,1);
 await assert.rejects(()=>extractMedia(new Uint8Array(MAX_MEDIA_BYTES+1),'audio/mpeg',new AbortController().signal),/50 MB/);assert.equal(calls,1);
}));
