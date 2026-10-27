'use client';
import {useEffect,type ReactNode} from 'react';
export function PonponMotionProvider({children}:{children:ReactNode}) {
 useEffect(()=>{
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  const sync=()=>{document.documentElement.dataset.ponponMotion=!preference.matches&&!document.hidden?'on':'off';};
  sync();preference.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
  return ()=>{preference.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);delete document.documentElement.dataset.ponponMotion;};
 },[]);
 return children;
}
