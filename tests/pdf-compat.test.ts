import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

test('PDF extraction works without the modern global Iterator API',()=>{
 // Isolate feature removal so it cannot affect the other tests.
 const result=spawnSync(process.execPath,['--input-type=module','-e',`
 globalThis.Iterator=undefined;
 const {extractFile}=await import('./lib/ingest.ts');
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
 const stream='BT /F1 12 Tf 72 720 Td (Active recall strengthens memory.) Tj ET';
 objects.push('<< /Length '+stream.length+' >>\\nstream\\n'+stream+'\\nendstream');
 let pdf='%PDF-1.4\\n';const offsets=[0];
 objects.forEach((o,i)=>{offsets.push(pdf.length);pdf+=(i+1)+' 0 obj\\n'+o+'\\nendobj\\n';});
 const start=pdf.length;pdf+='xref\\n0 6\\n0000000000 65535 f \\n';
 offsets.slice(1).forEach(o=>pdf+=String(o).padStart(10,'0')+' 00000 n \\n');
 pdf+='trailer\\n<< /Size 6 /Root 1 0 R >>\\nstartxref\\n'+start+'\\n%%EOF';
 // The application URL is browser-only; preconfigure the worker module for Node.
 const pdfjs=await import('pdfjs-dist/legacy/build/pdf.mjs');
 globalThis.pdfjsWorker=await import('pdfjs-dist/legacy/build/pdf.worker.mjs');
 const text=await extractFile(new File([pdf],'notes.pdf'),()=>{},new AbortController().signal);
 if(text!=='Active recall strengthens memory.')throw new Error(text);
 console.log('extraction passed');
 `],{encoding:'utf8',timeout:30000});
 assert.equal(result.status,0,result.stderr+result.stdout);
 assert.match(result.stdout,/extraction passed/);
});
