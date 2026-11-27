"use client";
import {useEffect,useState} from "react";
import MediaPanel from "./media-panel";
type Workspace={id:string;name:string;role:string};
type Item={id:string;title:string;body:string;status:"draft"|"ready"|"archived";updatedAt:string};
export default function DashboardPage(){
 const [workspaces,setWorkspaces]=useState<Workspace[]>([]),[workspaceId,setWorkspaceId]=useState(""),[items,setItems]=useState<Item[]>([]);
 const [title,setTitle]=useState(""),[body,setBody]=useState(""),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 async function loadItems(id:string){const r=await fetch("/api/v1/workspaces/"+id+"/content");if(!r.ok)throw new Error("تعذر تحميل المحتوى");const d=await r.json();setItems(d.items);}
 useEffect(()=>{fetch("/api/v1/me").then(async r=>{if(r.status===401){location.href="/login";return null;}if(!r.ok)throw new Error("تعذر تحميل الحساب");return r.json();}).then(async d=>{if(!d)return;setWorkspaces(d.workspaces);if(d.workspaces[0]){setWorkspaceId(d.workspaces[0].id);await loadItems(d.workspaces[0].id);}}).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);
 async function createContent(e:React.FormEvent){e.preventDefault();if(!workspaceId)return;const r=await fetch("/api/v1/workspaces/"+workspaceId+"/content",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title,body})});const d=await r.json();if(!r.ok){setError(d.error??"تعذر الحفظ");return;}setTitle("");setBody("");setError("");await loadItems(workspaceId);}
 async function changeStatus(item:Item,status:Item["status"]){const r=await fetch("/api/v1/workspaces/"+workspaceId+"/content/"+item.id,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({status})});if(!r.ok){setError("تعذر تحديث الحالة");return;}await loadItems(workspaceId);}
 async function logout(){await fetch("/api/v1/auth/logout",{method:"POST"});location.href="/login";}
 return <main className="app-shell"><header className="topbar"><div className="brand"><span className="brand-mark small">ن</span><span>نَوَاة</span></div><button className="secondary" onClick={logout}>تسجيل الخروج</button></header>
 <section className="welcome"><div><p className="eyebrow">مساحة إدارة المحتوى</p><h1>مرحباً بك 👋</h1><p className="muted">نظّم أفكارك وحوّلها إلى محتوى جاهز.</p></div>
 {workspaces.length>1&&<select value={workspaceId} onChange={async e=>{setWorkspaceId(e.target.value);await loadItems(e.target.value);}}>{workspaces.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select>}</section>
 {error&&<p className="error" role="alert">{error}</p>}
 <section className="dashboard-grid"><form className="panel composer" onSubmit={createContent}><div className="panel-heading"><div><p className="eyebrow">استوديو المحتوى</p><h2>فكرة جديدة</h2></div><span className="soft-tag">مسودة</span></div>
 <label>عنوان المحتوى<input required maxLength={180} value={title} onChange={e=>setTitle(e.target.value)} placeholder="مثال: إطلاق منتجنا الجديد"/></label><label>نص المحتوى<textarea rows={6} maxLength={30000} value={body} onChange={e=>setBody(e.target.value)} placeholder="اكتب فكرتك هنا…"/></label><button disabled={!workspaceId}>حفظ كمسودة</button></form>
 <section className="panel"><div className="panel-heading"><div><p className="eyebrow">مكتبة المحتوى</p><h2>أحدث أعمالك</h2></div><span className="count">{items.length}</span></div>
 {loading?<p className="muted">جارٍ التحميل…</p>:items.length===0?<div className="empty"><span>✦</span><p>لا يوجد محتوى بعد</p><small>ابدأ بكتابة أول فكرة في استوديو المحتوى.</small></div>:<div className="content-list">{items.map(item=><article className="content-item" key={item.id}><div><h3>{item.title}</h3><p>{item.body||"لا يوجد نص إضافي"}</p><small>{new Date(item.updatedAt).toLocaleString("ar")}</small></div><select aria-label="حالة المحتوى" value={item.status} onChange={e=>changeStatus(item,e.target.value as Item["status"])}><option value="draft">مسودة</option><option value="ready">جاهز</option><option value="archived">مؤرشف</option></select></article>)}</div>}</section></section>{workspaceId&&<MediaPanel workspaceId={workspaceId}/>}<footer>نَوَاة · إدارة المحتوى الاجتماعي باللغة العربية</footer></main>;
}
