import {MAX_DOCUMENT_BYTES,MAX_MEDIA_BYTES} from './upload-limits.ts';
export const ACCEPT='.pdf,.docx,.pptx,.png,.jpg,.jpeg,.mp3,.mp4,.mpeg,.mpga,.m4a,.wav,.webm,.txt,.md';
export const MAX_FILE=MAX_DOCUMENT_BYTES;
export const MAX_TEXT=120000;
function validateText(text:string){const clean=text.replace(/\r/g,'').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();if(!clean)throw new Error('No readable text found. For scanned documents, upload individual pages as PNG or JPG for OCR.');if(clean.length>MAX_TEXT)throw new Error('This file contains more than 120,000 characters. Split it into smaller chapters and upload each separately.');return clean;}
export async function extractFile(file:File,onProgress:(s:string)=>void,signal:AbortSignal):Promise<string>{
 signal.throwIfAborted();
 if(!file.size)throw new Error('This file is empty.');
 if(file.size>MAX_FILE)throw new Error('Documents can be up to 100 MB. Please split or compress this file.');
 const ext=file.name.split('.').pop()?.toLowerCase();
 onProgress('Reading your file…');
 if(ext==='txt'||ext==='md'){const text=await file.text();signal.throwIfAborted();return validateText(text);}
 if(ext==='docx'||ext==='pptx'){
 const {default:JSZip}=await import('jszip');const zip=await JSZip.loadAsync(await file.arrayBuffer());
 const names=Object.keys(zip.files).filter(n=>ext==='docx'?n==='word/document.xml':/^ppt\/slides\/slide\d+\.xml$/.test(n)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
 if(!names.length||names.length>400)throw new Error('This document is unsupported or has over 400 slides. Please split it into smaller files.');
 let total=0;const out:string[]=[];
 // JSZip exposes declared uncompressed sizes; reject zip bombs before expansion.
 for(const n of names){const f=zip.file(n)!;const size=(f as unknown as {_data?:{uncompressedSize?:number}})._data?.uncompressedSize;if(!size||size>8*1024*1024||total+size>24*1024*1024)throw new Error('The expanded document is too large. Please split it.');total+=size;}
 for(let i=0;i<names.length;i++){if(signal.aborted)throw new DOMException('Cancelled','AbortError');onProgress(ext==='pptx'?`Reading slide ${i+1} of ${names.length}…`:'Extracting document text…');const xml=new DOMParser().parseFromString(await zip.file(names[i])!.async('string'),'application/xml');if(xml.querySelector('parsererror'))throw new Error('The document contains invalid XML.');const paragraphs=Array.from(xml.getElementsByTagNameNS('*','p')).map(p=>Array.from(p.getElementsByTagNameNS('*','t')).map(t=>t.textContent||'').join('')).join('\n');out.push(paragraphs);}
 return validateText(out.join('\n\n'));
 }
 if(ext==='pdf'){
 const pdfjs=await import('pdfjs-dist/legacy/build/pdf.mjs');pdfjs.GlobalWorkerOptions.workerSrc='/pdf.worker.legacy.min.mjs';
 const task=pdfjs.getDocument({data:await file.arrayBuffer()});
 const abort=()=>{void task.destroy();};signal.addEventListener('abort',abort);
 try{const pdf=await task.promise;if(pdf.numPages>300)throw new Error('PDFs can contain up to 300 pages. Please split this document.');const pages:string[]=[];let size=0;for(let i=1;i<=pdf.numPages;i++){if(signal.aborted)throw new DOMException('Cancelled','AbortError');onProgress(`Extracting page ${i} of ${pdf.numPages}…`);const page=await pdf.getPage(i);const content=await page.getTextContent();const text=content.items.map(it=>'str' in it?it.str+('hasEOL' in it&&it.hasEOL?'\n':' '):'').join('');size+=text.length;if(size>MAX_TEXT)throw new Error('This PDF is too long. Split it into chapters.');pages.push(text);page.cleanup();}return validateText(pages.join('\n\n'));}finally{signal.removeEventListener('abort',abort);await task.destroy();}
 }
 if(['png','jpg','jpeg','mp3','mp4','mpeg','mpga','m4a','wav','webm'].includes(ext||'')){
 if(file.size>MAX_MEDIA_BYTES)throw new Error('Images and audio can be up to 50 MB. Split or compress this file.');
 onProgress('Preparing secure media upload…');
 const prepared=await fetch('/api/media-upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ext,size:file.size}),signal});
 const upload=await prepared.json() as {signedUrl:string;path:string;error?:string};
 if(!prepared.ok)throw new Error(upload.error||'Could not prepare upload.');
 try{
 onProgress('Uploading your media securely…');
 const sent=await fetch(upload.signedUrl,{method:'PUT',headers:{'Content-Type':file.type||'application/octet-stream'},body:file,signal});
 if(!sent.ok)throw new Error('Upload failed. Check your connection and retry.');
 onProgress(['png','jpg','jpeg'].includes(ext!)?'Reading image · automatically retrying if needed…':'Transcribing audio · automatically retrying if needed…');
 const response=await fetch('/api/extract',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:upload.path}),signal});
 const result=await response.json() as {error?:string;text:string};if(!response.ok)throw new Error(result.error||'Extraction failed. Please try again.');return validateText(result.text);
 }finally{
 // Independent signal lets cleanup run after cancellation or a failed network request.
 await fetch('/api/media-upload',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:upload.path}),signal:AbortSignal.timeout(5000)}).catch(()=>{});
 }
 }
 throw new Error('Unsupported format. Try PDF, DOCX, PPTX, PNG, JPG, audio, TXT, or Markdown.');
}

// Keep engine-specific errors out of the UI while preserving actionable parser errors.
export function fileErrorMessage(error:unknown):string {
 if(error instanceof TypeError || error instanceof ReferenceError) return 'Your browser could not read this file. Try updating Safari, uploading a TXT version, or pasting your notes below.';
 const message=error instanceof Error?error.message:'';
 if(!message) return 'Could not read this file. Try another file or paste your notes below.';
 if(error instanceof Error && error.name==='PasswordException') return 'This PDF is password-protected. Upload an unlocked copy.';
 if(error instanceof Error && error.name==='InvalidPDFException') return 'This PDF could not be read. Export a new PDF or paste your notes below.';
 return message;
}
