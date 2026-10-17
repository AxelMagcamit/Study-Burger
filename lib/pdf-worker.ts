// Classic workers avoid Safari's module-worker import/fallback failure path.
export function startPdfWorker(version:string,signal:AbortSignal):Promise<Worker>{
 signal.throwIfAborted();
 return new Promise((resolve,reject)=>{
  const worker=new Worker(`/pdf.worker.compat.js?v=${encodeURIComponent(version)}`);
  const cleanup=()=>{clearTimeout(timer);worker.removeEventListener('message',ready);worker.removeEventListener('error',failed);signal.removeEventListener('abort',cancel);};
  const fail=(error:Error)=>{cleanup();worker.terminate();reject(error);};
  const ready=(event:MessageEvent)=>{if(event.data?.type==='study-burger-pdf-ready'){cleanup();resolve(worker);}};
  const failed=()=>fail(new Error('The PDF reader could not load. Check your connection and retry, or paste your notes below.'));
  const cancel=()=>fail(new DOMException('Cancelled','AbortError'));
  const timer=setTimeout(failed,20000);
  worker.addEventListener('message',ready);worker.addEventListener('error',failed);signal.addEventListener('abort',cancel,{once:true});
  if(signal.aborted)cancel();
 });
}
