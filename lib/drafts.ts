import type {Data} from './study.ts';
import {validateData} from './storage.ts';
export type Draft = {data:Data; revision:number; savedAt:number};
export function draftKey(userId:string){return `study-burger:unsaved:${userId}`;}
export function readDraft(raw:string|null):Draft|null {
  if(!raw)return null;
  try{const d=JSON.parse(raw);if(!Number.isSafeInteger(d.revision)||d.revision<0||!Number.isFinite(d.savedAt))return null;return {data:validateData(d.data),revision:d.revision,savedAt:d.savedAt};}catch{return null;}
}
export function accountBytes(data:Data){return new TextEncoder().encode(JSON.stringify(data)).byteLength;}
export const MAX_ACCOUNT_BYTES=2_000_000;
