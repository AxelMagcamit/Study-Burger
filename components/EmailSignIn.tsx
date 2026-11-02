'use client';
import {useState,type FormEvent} from 'react';
export default function EmailSignIn({reset=false}:{reset?:boolean}){
 const [mode,setMode]=useState(reset?'update':'signin');
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();const form=event.currentTarget;const values=new FormData(form);setBusy(true);setError('');setMessage('');
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),20000);
  try{const response=await fetch('/auth/email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:mode,email:values.get('email'),password:values.get('password')}),signal:controller.signal});const data=await response.json();if(!response.ok)throw new Error(data.error||'Please try again.');if(data.redirect){window.location.assign('/');return;}setMessage(data.message);form.reset();}
  catch(e){setError(e instanceof Error&&e.name!=='AbortError'?e.message:'The request took too long. Please try again.');}finally{clearTimeout(timer);setBusy(false);}
 }
 function change(next:string){setMode(next);setMessage('');setError('');}
 return <section className="email-signin" aria-label="Email authentication">
 <h3>{mode==='signup'?'Create an account':mode==='recover'?'Reset your password':mode==='update'?'Choose a new password':'Sign in with email'}</h3>
 <form onSubmit={submit} key={mode}>
 {mode!=='update'&&<label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>}
 {mode!=='recover'&&<label>Password<input name="password" type="password" autoComplete={mode==='signin'?'current-password':'new-password'} minLength={mode==='signin'?1:8} maxLength={128} required/></label>}
 <button className="button" disabled={busy} type="submit">{busy?'Please wait…':mode==='signup'?'Create account':mode==='recover'?'Send recovery link':mode==='update'?'Save password':'Sign in'}</button>
 </form>
 {message&&<p role="status">{message}</p>}{error&&<p className="error" role="alert">{error}</p>}
 {!reset&&<div className="email-actions"><button type="button" className="text-button" disabled={busy} onClick={()=>change(mode==='signin'?'signup':'signin')}>{mode==='signin'?'Create an account':'Back to sign in'}</button>{mode==='signin'&&<button type="button" className="text-button" disabled={busy} onClick={()=>change('recover')}>Forgot password?</button>}</div>}
 </section>;
}
