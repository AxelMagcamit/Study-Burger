import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {startPdfWorker} from '../lib/pdf-worker.ts';

test('The generated classic PDF worker boots without module imports',()=>{
 const messages:unknown[]=[];
 const context:any={console,Blob,Response,Request,Headers,fetch,TextEncoder,TextDecoder,URL,URLSearchParams,setTimeout,clearTimeout,structuredClone,ReadableStream,AbortController,DOMException,performance};
 context.self=context;context.postMessage=(value:unknown)=>messages.push(value);context.onmessage=null;context.addEventListener=()=>{};
 runInNewContext(readFileSync('public/pdf.worker.compat.js','utf8'),context,{timeout:10000});
 assert.ok(messages.some((value:any)=>value.type==='study-burger-pdf-ready'));
});

test('PDF worker startup uses a classic worker, handles errors, and cancels',async()=>{
 const original=globalThis.Worker;
 let instance:FakeWorker;
 class FakeWorker extends EventTarget {
  terminated=false;
  url:string;
  constructor(url:string,options?:unknown){super();this.url=url;assert.equal(options,undefined);instance=this;}
  terminate(){this.terminated=true;}
 }
 Object.defineProperty(globalThis,'Worker',{value:FakeWorker,writable:true,configurable:true});
 try{
  const ready=startPdfWorker('6.4.299',new AbortController().signal);
  assert.match(instance!.url,/pdf.worker.compat.js\?v=6.4.299/);
  instance!.dispatchEvent(new MessageEvent('message',{data:{type:'study-burger-pdf-ready'}}));
  assert.equal(await ready,instance!);
  const failed=startPdfWorker('6.4.299',new AbortController().signal);
  instance!.dispatchEvent(new Event('error'));
  await assert.rejects(failed,/could not load/);assert.ok(instance!.terminated);
  const controller=new AbortController();const cancelled=startPdfWorker('6.4.299',controller.signal);controller.abort();
  await assert.rejects(cancelled,{name:'AbortError'});assert.ok(instance!.terminated);
 }finally{Object.defineProperty(globalThis,'Worker',{value:original,writable:true,configurable:true});}
});
