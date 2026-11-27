"use client";
import {FormEvent,useState} from "react";
import {useRouter} from "next/navigation";
export default function LoginPage(){
 const router=useRouter(),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 async function submit(event:FormEvent){event.preventDefault();setBusy(true);setError("");try{
  const response=await fetch("/api/v1/auth/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email,password})});
  const data=await response.json();if(!response.ok)throw new Error(data.error??"تعذر تسجيل الدخول");router.replace("/dashboard");router.refresh();
 }catch(e){setError(e instanceof Error?e.message:"حدث خطأ غير متوقع");}finally{setBusy(false);}}
 return <main className="auth-shell"><section className="auth-card"><div className="brand-mark">ن</div><p className="eyebrow">مساحة عملك الإبداعية</p><h1>مرحباً بعودتك</h1><p className="muted">سجّل الدخول لمتابعة محتواك وخططك.</p>
 <form onSubmit={submit} className="stack"><label>البريد الإلكتروني<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>كلمة المرور<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>
 {error&&<p className="error" role="alert">{error}</p>}<button disabled={busy}>{busy?"جارٍ الدخول…":"تسجيل الدخول"}</button></form><p className="hint">التسجيل العام غير متاح. يتم إنشاء المالك الأول عبر إجراء التهيئة الآمن.</p></section></main>;
}
