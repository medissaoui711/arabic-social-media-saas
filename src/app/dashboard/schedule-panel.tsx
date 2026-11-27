"use client";
import {useEffect,useState} from "react";
type Content={id:string;title:string;status:string};
type Schedule={id:string;status:string;scheduledAt:string;timezone:string;content:{title:string}};
export default function SchedulePanel({workspaceId}:{workspaceId:string}){
 const [content,setContent]=useState<Content[]>([]),[schedules,setSchedules]=useState<Schedule[]>([]),[contentId,setContentId]=useState(""),[localDateTime,setLocalDateTime]=useState(""),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
 async function load(){const [c,s]=await Promise.all([fetch(`/api/v1/workspaces/${workspaceId}/content`),fetch(`/api/v1/workspaces/${workspaceId}/schedules`)]);if(!c.ok||!s.ok)throw new Error("تعذر تحميل التقويم");const cd=await c.json(),sd=await s.json();setContent(cd.items.filter((x:Content)=>x.status==="ready"));setSchedules(sd.schedules);}
 useEffect(()=>{if(workspaceId)load().catch(e=>setMessage(e.message));},[workspaceId]);
 async function schedule(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage("");try{
  const r=await fetch(`/api/v1/workspaces/${workspaceId}/schedules`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({contentId,localDateTime,timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,idempotencyKey:crypto.randomUUID()})});
  const d=await r.json();if(!r.ok)throw new Error(d.error??"تعذرت الجدولة");await load();setMessage("تمت إضافة الموعد إلى التقويم.");
 }catch(e){setMessage(e instanceof Error?e.message:"تعذرت الجدولة");}finally{setBusy(false);}}
 async function transition(id:string,action:"cancel"|"complete"){const r=await fetch(`/api/v1/workspaces/${workspaceId}/schedules/${id}`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({action})});const d=await r.json();if(!r.ok){setMessage(d.error??"تعذر تحديث الموعد");return;}await load();}
 return <section className="panel feature-panel"><div className="panel-heading"><div><p className="eyebrow">التقويم الداخلي</p><h2>مواعيد المحتوى</h2></div><span className="count">{schedules.length}</span></div>
 <form className="inline-form" onSubmit={schedule}><label>المحتوى الجاهز<select required value={contentId} onChange={e=>setContentId(e.target.value)}><option value="">اختر محتوى</option>{content.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label><label>التاريخ والوقت المحلي<input type="datetime-local" required value={localDateTime} onChange={e=>setLocalDateTime(e.target.value)}/></label><button disabled={busy||!contentId}>جدولة</button></form>
 {message&&<p className="hint" role="status">{message}</p>}
 <div className="content-list">{schedules.map(s=><article className="content-item" key={s.id}><div><h3>{s.content.title}</h3><p>{new Date(s.scheduledAt).toLocaleString("ar")} · {s.timezone}</p><small>الحالة: {s.status}</small></div><div className="action-row">{s.status==="scheduled"&&<button className="secondary" onClick={()=>transition(s.id,"cancel")}>إلغاء</button>}{s.status==="due"&&<button onClick={()=>transition(s.id,"complete")}>إكمال</button>}</div></article>)}</div>
 </section>;
}
