import {mkdirSync} from 'node:fs';
import {build} from 'esbuild';
mkdirSync('public',{recursive:true});
// Compile the compatibility build as a classic worker, without runtime imports.
await build({entryPoints:['node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'],outfile:'public/pdf.worker.compat.js',bundle:true,format:'iife',platform:'browser',target:['safari16'],minify:true,footer:{js:'self.postMessage({type:"study-burger-pdf-ready"});'}});
