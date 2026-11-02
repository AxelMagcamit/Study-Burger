'use client';
import {useEffect,useState} from 'react';
export default function MfaSettings({challenge=false}:{challenge?:boolean}){
 const [factors,setFactors]=useState<{id:string;friendlyName:string}[]>([]),[selected,setSelected]=useState('');
 const [setup,setSetup]=useState<{id:string;qr:string;secret:string}|null>(null),[code,setCode]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[loaded,setLoaded]=useState(false);
 async function load(){try{const r=await fetch('/api/mfa',{cache:'no-store'});const d=await r.json();if(!r.ok)throw Error(d.error);setFactors(d.factors);setSelected(d.factors[0]?.id||'');setLoaded(true);}catch(e){setError((e as Error).message);}}
 useEffect(()=>{void load();},[]);
 async function act(action:string){setBusy(true);setError('');try{const r=await fetch('/api/mfa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,factorId:setup?.id||selected,code})});const d=await r.json();if(!r.ok)throw Error(d.error);setCode('');if(action==='enroll')setSetup(d);else if(challenge)window.location.reload();else{setSetup(null);await load();}}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <section className="account-section"><h3>{challenge?'Verify your sign-in':'Two-factor authentication'}</h3><p>{challenge?'Enter the code from your authenticator app to open your workspace.':'Add an authenticator app for extra protection after signing in.'}</p>
 {error&&<p role="alert" className="error">{error}</p>}{!loaded&&!error&&<p role="status">Loading security settings…</p>}
 {setup&&<><img className="mfa-qr" src={setup.qr} alt="Scan this setup QR code with your authenticator app"/><p>Or enter this setup key in your authenticator:</p><code className="setup-secret">{setup.secret}</code><p>Keep a secure backup in your authenticator app. Study Burger does not provide recovery codes. Setup completes only after you verify a code.</p></>}
 {(setup||factors.length>0)&&<form onSubmit={e=>{e.preventDefault();void act('verify');}}>{!setup&&factors.length>1&&<label className="field">Authenticator<select value={selected} onChange={e=>setSelected(e.target.value)}>{factors.map(f=><option key={f.id} value={f.id}>{f.friendlyName||'Authenticator'}</option>)}</select></label>}<label className="field">Six-digit code<input value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required maxLength={6}/></label><div className="button-row"><button className="button" disabled={busy} type="submit">{busy?'Please wait…':setup?'Enable 2FA':challenge?'Verify and continue':'Verify code'}</button>{!challenge&&!setup&&<button className="button secondary" disabled={busy||code.length!==6} type="button" onClick={()=>{if(window.confirm('Turn off this authenticator?'))void act('remove');}}>Turn off 2FA</button>}</div></form>}
 {!challenge&&loaded&&!setup&&factors.length===0&&<button className="button secondary" disabled={busy} onClick={()=>void act('enroll')}>Set up authenticator</button>}
 {!challenge&&factors.length>0&&!setup&&<p role="status">Two-factor authentication is enabled.</p>}
 {challenge&&<form action="/auth/logout" method="post"><button className="button secondary" type="submit">Sign out</button></form>}
 </section>;
}
