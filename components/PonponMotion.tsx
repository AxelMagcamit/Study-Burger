'use client';

import {createContext, useContext, useEffect, useState, type ReactNode} from 'react';
import {Pause, Play} from 'lucide-react';

const storageKey = 'study-burger-ponpon-motion-v1';
const MotionContext = createContext({paused: false, reduced: false, toggle: () => {}});

export function PonponMotionProvider({children}: {children: ReactNode}) {
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setReduced(preference.matches);
    const syncVisibility = () => setVisible(!document.hidden);
    const syncStorage = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) setPaused(event.newValue === 'paused');
    };
    try { setPaused(localStorage.getItem(storageKey) === 'paused'); } catch { /* Works without storage. */ }
    syncPreference();
    syncVisibility();
    setReady(true);
    preference.addEventListener('change', syncPreference);
    document.addEventListener('visibilitychange', syncVisibility);
    window.addEventListener('storage', syncStorage);
    return () => {
      preference.removeEventListener('change', syncPreference);
      document.removeEventListener('visibilitychange', syncVisibility);
      window.removeEventListener('storage', syncStorage);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.ponponMotion = ready && !paused && !reduced && visible ? 'on' : 'off';
    return () => { delete document.documentElement.dataset.ponponMotion; };
  }, [ready, paused, reduced, visible]);

  function toggle() {
    const next = !paused;
    setPaused(next);
    try { localStorage.setItem(storageKey, next ? 'paused' : 'playing'); } catch { /* Session-only preference. */ }
  }

  return <MotionContext.Provider value={{paused, reduced, toggle}}>{children}</MotionContext.Provider>;
}

export function PonponMotionButton() {
  const {paused, reduced, toggle} = useContext(MotionContext);
  const label = reduced ? 'Ponpon motion is off: reduced motion is enabled on your device' : paused ? 'Play Ponpon animation' : 'Pause Ponpon animation';
  return <button type="button" className="icon-button ponpon-motion-button" onClick={toggle}
    disabled={reduced} aria-label={label} title={label}>
    {paused || reduced ? <Play size={18} aria-hidden="true"/> : <Pause size={18} aria-hidden="true"/>}
  </button>;
}
