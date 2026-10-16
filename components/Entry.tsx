'use client';
import {useEffect,useState} from 'react';
import dynamic from 'next/dynamic';
import {ArrowRight,FileText,Moon,Sun,RotateCcw,Layers} from 'lucide-react';
import Ponpon from './Ponpon';
import {PonponMotionButton} from './PonponMotion';
import GoogleSignIn from './GoogleSignIn';
import type {AccountUser} from '@/lib/auth';
const Dashboard=dynamic(()=>import('./Dashboard'),{loading:()=> <div className="loading-app"><Ponpon mood="thinking" className="state-ponpon" animate decorative/><p role="status">Opening your workspace…</p></div>});
export default function Entry(){
 const [session,setSession]=useState<{configured:boolean;user:AccountUser|null}|null>(null);
 const [demo,setDemo]=useState(false),[error,setError]=useState(''),[theme,setTheme]=useState('light');
 useEffect(()=>{const controller=new AbortController();fetch('/api/session',{cache:'no-store',signal:controller.signal}).then(async r=>{if(!r.ok)throw new Error('Could not check sign-in. Reload to try again.');setSession(await r.json());}).catch(e=>{if(e.name!=='AbortError')setError(e.message);});if(new URLSearchParams(window.location.search).has('auth_error')){setError('Sign-in did not finish. Please try again.');history.replaceState(null,'','/');}try{const saved=localStorage.getItem('study-burger-theme')==='dark'?'dark':'light';setTheme(saved);document.documentElement.dataset.theme=saved;}catch{}return()=>controller.abort();},[]);
 function toggleTheme(){const next=theme==='light'?'dark':'light';setTheme(next);document.documentElement.dataset.theme=next;try{localStorage.setItem('study-burger-theme',next);}catch{}}
 if(demo||session?.user)return <Dashboard key={demo?'demo':session!.user!.userId} demo={demo} user={session?.user||undefined} onLeave={()=>{setDemo(false);if(session?.user)window.location.href='/';}}/>;
 return <div className="storybook compact-home"><a className="skip-link" href="#main-content">Skip to content</a>
  <header className="story-header"><a href="/" className="brand story-brand" aria-label="Study Burger home"><img src="/ponpon.svg" width="48" height="48" alt=""/><span>study<br/><b>burger.</b></span></a><nav className="story-nav" aria-label="Main navigation"><a href="#how-it-works">How it works</a><button className="icon-button" onClick={toggleTheme} aria-label={`Switch to ${theme==='light'?'dark':'light'} mode`}>{theme==='light'?<Moon size={18}/>:<Sun size={18}/>}</button><PonponMotionButton/><a className="button story-nav-cta" href="#sign-in">Sign in</a></nav></header>
  <main id="main-content"><section className="home-main" aria-labelledby="home-title"><div className="home-intro"><span className="home-eyebrow">FLASHCARDS & SPACED REPETITION</span><h1 id="home-title">Learn it.<br/><em>Remember it.</em></h1><p>Create flashcards from your notes and review what’s due.</p></div><div className="login-card story-login welcome-login" id="sign-in"><div className="signin-welcome"><div className="signin-portrait"><Ponpon mood="welcome" animate decorative/></div><div><h2>Welcome</h2><p>Save your decks and progress.</p></div></div><GoogleSignIn enabled={!!session?.configured} checking={!session&&!error}/><div className="signin-preview"><button className="text-button sample-button" onClick={()=>setDemo(true)}>Explore sample decks <ArrowRight size={16}/></button><p className="sample-note">No sign-in needed · Changes aren’t saved</p></div><a className="signin-privacy" href="/privacy">Privacy &amp; data</a>{error&&<div className="error" role="alert"><p>{error}</p><button className="text-button" onClick={()=>window.location.reload()}>Reload</button></div>}</div></section>
   <section className="home-steps" id="how-it-works" aria-label="How it works">{[{icon:FileText,title:'1. Add material',text:'Upload a document or write your own cards.'},{icon:Layers,title:'2. Review cards',text:'Try to answer, then flip and rate your recall.'},{icon:RotateCcw,title:'3. Return when due',text:'Your ratings schedule the next review.'}].map(({icon:Icon,title,text})=><div key={title}><Icon size={23} strokeWidth={1.5}/><div><h2>{title}</h2><p>{text}</p></div></div>)}</section>
  </main><footer className="compact-footer"><span>Study Burger</span><a href="/privacy">Privacy & data</a><a href="https://github.com/AxelMagcamit/Study-Burger" target="_blank" rel="noreferrer">GitHub ↗</a></footer>
 </div>;
}
