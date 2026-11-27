"use client";
import {useEffect,useState} from "react";
type Asset={id:string;originalName:string;mimeType:string;sizeBytes:number;createdAt:string};
export default function MediaPanel({workspaceId}:{workspaceId:string}){
 const [assets,setAssets]=useState<Asset[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 async function load(){if(!workspaceId)return;const r=await fetch(`/api/v1/workspaces/${workspaceId}/media`);if(!r.ok)throw new Error("تعذر تحميل الوسائط");const d=await r.json();setAssets(d.assets);}
 useEffect(()=>{load().catch(e=>setMessage(e.message));},[workspaceId]);
 async function upload(e:React.ChangeEvent<HTMLInputElement>){const file=e.target.files?.[0];if(!file)return;setBusy(true);setMessage("");try{
  const form=new FormData();form.set("file",file);const r=await fetch(`/api/v1/workspaces/${workspaceId}/media`,{method:"POST",body:form});const d=await r.json();if(!r.ok)throw new Error(d.error??"تعذر رفع الملف");await load();setMessage("تم رفع الملف والتحقق من محتواه.");
 }catch(e){setMessage(e instanceof Error?e.message:"تعذر رفع الملف");}finally{setBusy(false);e.target.value="";}}
 return <section className="panel media-panel"><div className="panel-heading"><div><p className="eyebrow">مكتبة الوسائط</p><h2>الملفات المرفوعة</h2></div><span className="count">{assets.length}</span></div>
 <label className="upload-control">رفع صورة أو فيديو<input type="file" accept="image/jpeg,image/png,image/webp,video/mp4" disabled={busy||!workspaceId} onChange={upload}/></label>
 {message&&<p className="hint" role="status">{message}</p>}
 {assets.map(a=><a className="media-row" key={a.id} href={`/api/v1/workspaces/${workspaceId}/media/${a.id}`}><span>{a.originalName}</span><small>{a.mimeType} · {(a.sizeBytes/1024/1024).toFixed(2)} MB</small></a>)}
 </section>;
}
