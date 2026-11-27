"use client";
import {FormEvent,useState} from "react";
export default function SetupPage(){
 const [token,setToken]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[displayName,setDisplayName]=useState(""),[workspaceName,setWorkspaceName]=useState(""),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setMessage("");try{
  const r=await fetch("/api/v1/bootstrap",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({token,email,password,displayName,workspaceName})});
  const d=await r.json();if(!r.ok)throw new Error(d.error??"تعذرت التهيئة");
  setMessage("تم إنشاء المالك الأول ومساحة العمل. انتقل الآن إلى تسجيل الدخول.");
 }catch(e){setMessage(e instanceof Error?e.message:"حدث خطأ غير متوقع");}finally{setBusy(false);}}
 return <main className="auth-shell"><section className="auth-card"><div className="brand-mark">ن</div><p className="eyebrow">تهيئة أول مرة فقط</p><h1>إنشاء مساحة العمل الأولى</h1><p className="muted">هذا الإجراء يتوقف تلقائياً بعد إنشاء أول حساب مالك.</p>
 <form className="stack" onSubmit={submit}>
 <label>رمز التهيئة<input type="password" required minLength={32} value={token} onChange={e=>setToken(e.target.value)} autoComplete="off"/></label>
 <label>اسم المالك<input required minLength={2} maxLength={120} value={displayName} onChange={e=>setDisplayName(e.target.value)}/></label>
 <label>البريد الإلكتروني<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
 <label>كلمة المرور (12 حرفاً على الأقل)<input type="password" required minLength={12} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password"/></label>
 <label>اسم مساحة العمل<input required minLength={2} maxLength={120} value={workspaceName} onChange={e=>setWorkspaceName(e.target.value)}/></label>
 {message&&<p className="hint" role="status">{message}</p>}<button disabled={busy}>{busy?"جارٍ إنشاء الحساب…":"إنشاء المالك الأول"}</button>
 </form><p className="hint">لا تشارك رمز التهيئة. احذفه أو غيّره من البيئة بعد نجاح التهيئة.</p><a href="/login">العودة لتسجيل الدخول</a></section></main>;
}
