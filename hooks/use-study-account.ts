'use client';
import {useState,useEffect,useRef,useCallback,type SetStateAction} from 'react';
import {type Data,seedData} from '@/lib/study';
import {validateData} from '@/lib/storage';
import {accountBytes,draftKey,readDraft,MAX_ACCOUNT_BYTES,type Draft} from '@/lib/drafts';
const EMPTY:Data={decks:[],reviews:[],goal:20};
export function useStudyAccount(demo:boolean,userId?:string){
 const [data,commitData]=useState<Data>(EMPTY);
 const [ready,setReady]=useState(false);
 const [sync,setSync]=useState('Loading…');
 const [error,setError]=useState('');
 const [recovery,setRecovery]=useState<Draft|null>(null);
 const revision=useRef(0),latest=useRef(data),saved=useRef('');
 const running=useRef(false),active=useRef(true),blocked=useRef(false),loaded=useRef(false);
 const storageKey=userId?draftKey(userId):null;
 const retainDraft=useCallback((value:Data)=>{if(!storageKey||demo)return;try{sessionStorage.setItem(storageKey,JSON.stringify({data:value,revision:revision.current,savedAt:Date.now()}));}catch{/* Unload warning and export remain available if browser storage is full. */}},[storageKey,demo]);
 const setData=useCallback((action:SetStateAction<Data>)=>{const next=typeof action==='function'?action(latest.current):action;latest.current=next;retainDraft(next);commitData(next);},[retainDraft]);
 useEffect(()=>{
  active.current=true;loaded.current=false;blocked.current=false;
  const controller=new AbortController();
  if(demo){const sample=seedData();latest.current=sample;saved.current=JSON.stringify(sample);commitData(sample);loaded.current=true;setReady(true);setSync('Sample');return()=>{active.current=false;};}
  fetch('/api/account',{cache:'no-store',signal:controller.signal}).then(async r=>{
   const body=await r.json() as {data:unknown;revision:number;error?:string};
   if(!r.ok)throw new Error(body.error||'Could not load your account. Try again.');
   const d=body.data?validateData(body.data):{...EMPTY,decks:[],reviews:[]};
   if(controller.signal.aborted)return;
   revision.current=body.revision;saved.current=JSON.stringify(d);latest.current=d;
   if(storageKey){try{const draft=readDraft(sessionStorage.getItem(storageKey));if(draft&&JSON.stringify(draft.data)!==saved.current){blocked.current=true;setRecovery(draft);}else sessionStorage.removeItem(storageKey);}catch{}}
   commitData(d);loaded.current=true;setReady(true);setSync('Saved');
  }).catch(e=>{if(!controller.signal.aborted){setError(e.message);setSync('Account unavailable');}});
  return()=>{active.current=false;controller.abort();};
 },[demo,storageKey]);
 const flush=useCallback(async()=>{
  if(demo||!loaded.current||running.current||blocked.current)return;
  running.current=true;
  try{
   while(active.current){
    const snapshot=JSON.stringify(latest.current);if(snapshot===saved.current)break;
    if(accountBytes(latest.current)>MAX_ACCOUNT_BYTES)throw new Error('Account storage is full. Export a backup, then remove unused decks or cards.');
    setSync('Saving…');
    const response=await fetch('/api/account',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:JSON.parse(snapshot),revision:revision.current}),keepalive:new TextEncoder().encode(snapshot).byteLength<50000});
    let result:{revision:number;error?:string};
    try{result=await response.json();}catch{throw new Error('Could not save. Check your connection and retry.');}
    if(!response.ok){if(response.status===409)blocked.current=true;throw new Error(response.status===401?'Your session expired. Export your changes, then sign in again.':result.error||'Could not save. Retry or export a backup.');}
    revision.current=result.revision;saved.current=snapshot;
    if(storageKey){try{if(JSON.stringify(latest.current)===snapshot)sessionStorage.removeItem(storageKey);else retainDraft(latest.current);}catch{}}
    if(active.current){setError('');setSync('Saved');}
   }
  }catch(e){if(active.current){retainDraft(latest.current);setError((e as Error).message);setSync('Not saved');}}
  finally{running.current=false;}
 },[demo,storageKey,retainDraft]);
 useEffect(()=>{if(!ready||demo||recovery)return;setSync(JSON.stringify(data)===saved.current?'Saved':'Saving…');const timer=setTimeout(()=>void flush(),500);return()=>clearTimeout(timer);},[data,ready,demo,flush,recovery]);
 useEffect(()=>{
  const unload=(e:BeforeUnloadEvent)=>{if(!demo&&loaded.current&&JSON.stringify(latest.current)!==saved.current){retainDraft(latest.current);e.preventDefault();e.returnValue='';}};
  const visibility=()=>{if(document.visibilityState==='hidden')void flush();};
  const online=()=>{void flush();};
  window.addEventListener('beforeunload',unload);window.addEventListener('online',online);document.addEventListener('visibilitychange',visibility);
  return()=>{window.removeEventListener('beforeunload',unload);window.removeEventListener('online',online);document.removeEventListener('visibilitychange',visibility);};
 },[demo,flush,retainDraft]);
 function restoreDraft(){if(!recovery||recovery.revision!==revision.current)return;blocked.current=false;setRecovery(null);setData(recovery.data);}
 function discardDraft(){if(storageKey)try{sessionStorage.removeItem(storageKey);}catch{}blocked.current=false;setRecovery(null);}
 return {data,setData,ready,sync,error,retry:()=>void flush(),canRetry:!blocked.current,recovery,restoreDraft,discardDraft,canRestore:recovery?.revision===revision.current};
}
