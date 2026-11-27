"use client";
import {useEffect,useState} from "react";
type Account={id:string;platform:string;accountName:string;handle:string;notes:string|null};
export default function SocialPanel({workspaceId}:{workspaceId:string}){
 const [accounts,setAccounts]=useState<Account[]>([]),[platform,setPlatform]=useState("instagram"),[accountName,setAccountName]=useState(""),[handle,setHandle]=useState(""),[notes,setNotes]=useState(""),[message,setMessage]=useState("");
 async function load(){const r=await fetch(`/api/v1/workspaces/${workspaceId}/social-accounts`);if(!r.ok)throw new Error("تعذر تحميل الحسابات");setAccounts((await r.json()).accounts);}
 useEffect(()=>{if(workspaceId)load().catch(e=>setMessage(e.message));},[workspaceId]);
 async function add(e:React.FormEvent){e.preventDefault();const r=await fetch(`/api/v1/workspaces/${workspaceId}/social-accounts`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({platform,accountName,handle,notes})});const d=await r.json();if(!r.ok){setMessage(d.error??"تعذرت الإضافة");return;}setAccountName("");setHandle("");setNotes("");setMessage("تم حفظ البيانات الوصفية للحساب.");await load();}
 async function remove(id:string){const r=await fetch(`/api/v1/workspaces/${workspaceId}/social-accounts/${id}`,{method:"DELETE"});if(!r.ok){setMessage("تعذر حذف الحساب");return;}await load();}
 return <section className="panel feature-panel"><div className="panel-heading"><div><p className="eyebrow">الحسابات الاجتماعية</p><h2>سجلات الحسابات</h2></div><span className="count">{accounts.length}</span></div>
 <form className="inline-form" onSubmit={add}><label>المنصة<select value={platform} onChange={e=>setPlatform(e.target.value)}><option value="instagram">Instagram</option><option value="facebook">Facebook</option><option value="tiktok">TikTok</option><option value="youtube">YouTube</option><option value="linkedin">LinkedIn</option><option value="x">X</option><option value="other">أخرى</option></select></label><label>اسم الحساب<input required maxLength={120} value={accountName} onChange={e=>setAccountName(e.target.value)}/></label><label>المعرّف<input required maxLength={120} value={handle} onChange={e=>setHandle(e.target.value)} placeholder="@brand"/></label><label>ملاحظات<input maxLength={1000} value={notes} onChange={e=>setNotes(e.target.value)}/></label><button>إضافة</button></form>
 {message&&<p className="hint" role="status">{message}</p>}
 <div className="content-list">{accounts.map(a=><article className="content-item" key={a.id}><div><h3>{a.accountName}</h3><p>{a.platform} · {a.handle}</p>{a.notes&&<small>{a.notes}</small>}</div><button className="secondary" onClick={()=>remove(a.id)}>حذف</button></article>)}</div>
 <p className="hint">هذه سجلات داخلية فقط؛ لا يوجد ربط OAuth أو نشر خارجي.</p>
 </section>;
}
