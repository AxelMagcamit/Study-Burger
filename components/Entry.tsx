'use client';
import {useEffect,useState} from 'react';
import dynamic from 'next/dynamic';
import {ArrowRight,ArrowUpRight,BookOpen,Brain,Clock,Keyboard,Layers,Moon,ShieldCheck,Smartphone,Sparkles,Sun} from 'lucide-react';
import Ponpon from './Ponpon';
import StudyGarden from './StudyGarden';
import type {AccountUser} from '@/lib/auth';
const Dashboard=dynamic(()=>import('./Dashboard'),{loading:()=> <div className="loading-app">Opening your study space…</div>});
const chapters = [
  {number:'01',title:'Gather your ingredients.',description:'Start with your notes, slides, or a big idea. Shape what matters into a deck of focused flashcards.',icon:Layers,label:'COLLECT'},
  {number:'02',title:'Give curiosity a little room.',description:'Read a question. Reach for the answer. Flip the card and discover what’s starting to stick.',icon:Brain,label:'RECALL'},
  {number:'03',title:'Come back. Grow a little.',description:'Rate your recall and let spaced repetition guide your next visit. Small sessions add up.',icon:Sun,label:'REPEAT'},
];
export default function Entry(){
  const [session,setSession]=useState<{configured:boolean;user:AccountUser|null}|null>(null);
  const [demo,setDemo]=useState(false);
  const [error,setError]=useState('');
  const [theme,setTheme]=useState('light');
  useEffect(()=>{
    const controller=new AbortController();
    fetch('/api/session',{cache:'no-store',signal:controller.signal}).then(async r=>{if(!r.ok)throw new Error('Could not check your session. Reload to try again.');setSession(await r.json() as {configured:boolean;user:AccountUser|null});}).catch(e=>{if(e.name!=='AbortError')setError(e.message);});
    if(new URLSearchParams(window.location.search).has('auth_error')){setError('Google sign-in was cancelled or could not finish. Please try again.');history.replaceState(null,'','/');}
    try{const saved=localStorage.getItem('study-burger-theme')==='dark'?'dark':'light';setTheme(saved);document.documentElement.dataset.theme=saved;}catch{}
    return()=>controller.abort();
  },[]);
  function toggleTheme(){const next=theme==='light'?'dark':'light';setTheme(next);document.documentElement.dataset.theme=next;try{localStorage.setItem('study-burger-theme',next);}catch{}}
  if(demo||session?.user)return <Dashboard key={demo?'demo':session!.user!.userId} demo={demo} user={session?.user||undefined} onLeave={()=>{setDemo(false);if(session?.user)window.location.href='/';}}/>;
  return <div className="storybook">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <div className="story-announcement"><Sun size={13}/><span>A LITTLE PRACTICE. A LITTLE PROGRESS. A LITTLE PONPON.</span><Sun size={13}/></div>
    <header className="story-header">
      <a href="/" className="brand story-brand" aria-label="Study Burger home"><img src="/ponpon.svg" width="48" height="48" alt=""/><span>study<br/><b>burger.</b></span></a>
      <span className="edition-mark">THE PONPON EDITION <span>✳</span> No. 001</span>
      <nav className="story-nav" aria-label="Main navigation"><a className="story-nav-link" href="#how-it-works">The little routine</a><a className="story-nav-link" href="#meet-ponpon">Meet Ponpon</a><button className="icon-button" onClick={toggleTheme} aria-label={`Switch to ${theme==='light'?'dark':'light'} mode`}>{theme==='light'?<Moon size={18}/>:<Sun size={18}/>}</button><a className="button story-nav-cta" href="#sign-in">Your study space <ArrowUpRight size={16}/></a></nav>
    </header>
    <main id="main-content">
      <section className="story-hero" aria-labelledby="story-title">
        <div className="hero-corner corner-left" aria-hidden="true">MADE FOR<br/>CURIOUS MINDS</div><div className="hero-corner corner-right" aria-hidden="true">SMALL STEPS.<br/>SUNNY DAYS.</div>
        <div className="story-hero-copy"><p className="story-kicker"><span/> A SMALL ADVENTURE IN LEARNING <span/></p><h1 id="story-title">A little curious.<br/><em>A lot to discover.</em></h1><p>Turn your notes into knowledge that stays.<br/>One flashcard, one small win, and one fluffy study buddy.</p><div className="story-hero-actions"><button className="button primary" onClick={()=>setDemo(true)}>Explore a sample <ArrowRight size={17}/></button><a className="button story-outline" href="#how-it-works">Find your study flow</a></div><span className="hero-footnote">Your next chapter starts with a single card.</span></div>
        <StudyGarden/>
        <div className="garden-caption"><span>WELCOME TO PONPON’S LITTLE WORLD</span><span>Est. one card at a time <Sparkles size={14}/></span></div>
      </section>
      <div className="story-ribbon"><span><BookOpen size={17}/> Think before you flip.</span><span aria-hidden="true">✳</span><span><Clock size={17}/> A few minutes, just for you.</span><span aria-hidden="true">✳</span><span><Sun size={17}/> Little habits. Lasting knowledge.</span></div>
      <section className="story-chapters story-section" id="how-it-works" aria-labelledby="routine-title"><div className="story-section-heading"><div><p className="story-kicker">THE LITTLE ROUTINE</p><h2 id="routine-title">Good things grow<br/><em>one bite at a time.</em></h2></div><p>No marathon sessions required.<br/>Just a simple rhythm you can come back to.</p></div><div className="chapter-grid">{chapters.map(({number,title,description,icon:Icon,label})=><article className="chapter-card" key={number}><div className="chapter-top"><span>CHAPTER {number}</span><ArrowUpRight size={19}/></div><div className={`chapter-illustration chapter-${number}`} aria-hidden="true"><span className="chapter-orbit"/><Icon size={70} strokeWidth={1}/><span className="chapter-spark">✳</span></div><span className="chapter-label">{label}</span><h3>{title}</h3><p>{description}</p></article>)}</div></section>
      <section className="ponpon-story" id="meet-ponpon" aria-labelledby="ponpon-title"><div className="ponpon-portrait"><span className="portrait-stamp">OFFICIAL STUDY COMPANION<br/><b>100% fluff. 0% judgement.</b></span><span className="portrait-sun" aria-hidden="true"/><Ponpon className="portrait-cat"/><span className="portrait-signature">a friend for every chapter.</span></div><div className="ponpon-story-copy"><p className="story-kicker">MEET YOUR LITTLE COMPANION</p><h2 id="ponpon-title">Big eyes.<br/>Small steps.<br/><em>Always on your side.</em></h2><p>This is Ponpon. Part gray cloud, part sunflower, and a firm believer that showing up is already a good start.</p><p>A forgotten answer? A fresh deck? A five-minute victory? There’s a cozy corner here for all of it.</p><button className="button primary" onClick={()=>setDemo(true)}>Study a little with Ponpon <ArrowUpRight size={18}/></button><span className="story-signoff">NO PRESSURE. JUST A LITTLE PROGRESS.</span></div></section>
      <section className="story-signin story-section" id="sign-in" aria-labelledby="signin-title"><div><p className="story-kicker">A SPACE THAT’S YOURS</p><h2 id="signin-title">Make yourself<br/><em>right at home.</em></h2><p>Your decks, your pace, your next little discovery.<br/>A study space you’ll want to come back to.</p><div className="story-device-list"><span><Keyboard size={19}/> Keyboard friendly</span><span><Smartphone size={19}/> Ready for anywhere</span></div></div><div className="login-card story-login"><span className="signin-sun" aria-hidden="true">✳</span><h3>Let’s start your next chapter.</h3><p>One Google account. Your own study space.</p><form method="post" action="/auth/google" target="_top"><button className="google-button" type="submit" disabled={!session?.configured}><GoogleMark/>Continue with Google<ArrowRight size={17}/></button></form><small>{session?.configured?'New here? Your account is created automatically.':session?'Google sign-in is being configured. Explore the sample in the meantime.':'Checking sign-in availability…'}</small><button className="text-button" onClick={()=>setDemo(true)}>Take a peek at the sample <ArrowRight size={14}/></button>{error&&<div className="error" role="alert">{error}</div>}<div className="login-privacy"><ShieldCheck size={14}/><span>Your decks stay private to your account.</span></div></div></section>
    </main>
    <footer className="story-footer"><div className="footer-top"><span>MADE FOR CURIOUS MINDS.<br/>APPROVED BY PONPON.</span><div><a href="/privacy">Privacy & data <ArrowUpRight size={14}/></a><a href="https://github.com/AxelMagcamit/Study-Burger" target="_blank" rel="noreferrer">Find us on GitHub <ArrowUpRight size={14}/></a></div><a href="#main-content" aria-label="Back to top" className="footer-top-link">↑</a></div><div className="footer-wordmark" aria-hidden="true">study burger<span>✳</span></div><div className="footer-bottom"><span>Small bites. Sunny study days.</span><span>THE PONPON EDITION — 001</span></div></footer>
  </div>;
}
function GoogleMark(){return <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.97-3.38.97-2.6 0-4.82-1.76-5.61-4.13H3.04v2.59A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.39 13.92A6 6 0 0 1 6.08 12c0-.67.12-1.32.31-1.92V7.49H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.51l3.35-2.59Z"/><path fill="#EA4335" d="M12 5.95c1.47 0 2.78.51 3.82 1.5l2.86-2.86A9.57 9.57 0 0 0 12 2a10 10 0 0 0-8.96 5.49l3.35 2.59C7.18 7.71 9.4 5.95 12 5.95Z"/></svg>;}
