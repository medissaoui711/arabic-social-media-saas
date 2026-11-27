import {createHash} from "node:crypto";
import {isSameOrigin} from "@/lib/request-security";
import {NextRequest,NextResponse} from "next/server";
import {fileTypeFromBuffer} from "file-type";
import {getCurrentUser} from "@/lib/auth";
import {AccessDeniedError,WRITE_ROLES,withWorkspace} from "@/lib/tenant";
import {deleteMediaFile,saveMediaFile} from "@/lib/media-storage";
type Context={params:Promise<{workspaceId:string}>};
const MAX_BYTES=20*1024*1024;
const ALLOWED=new Set(["image/jpeg","image/png","image/webp","video/mp4"]);
export async function GET(_request:NextRequest,context:Context){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:"غير مصرح"},{status:401});
 const {workspaceId}=await context.params;
 try{
  const assets=await withWorkspace(user.id,workspaceId,null,tx=>tx.mediaAsset.findMany({where:{workspaceId},orderBy:{createdAt:"desc"},take:100}));
  return NextResponse.json({assets});
 }catch(e){if(e instanceof AccessDeniedError)return NextResponse.json({error:"لا تملك صلاحية الوصول"},{status:403});throw e;}
}
export async function POST(request:NextRequest,context:Context){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:"غير مصرح"},{status:401});
 if(!isSameOrigin(request))return NextResponse.json({error:"طلب غير صالح"},{status:403});
 const form=await request.formData().catch(()=>null),file=form?.get("file");
 if(!(file instanceof File))return NextResponse.json({error:"اختر ملفاً صالحاً"},{status:400});
 if(file.size<1||file.size>MAX_BYTES)return NextResponse.json({error:"حجم الملف يتجاوز الحد المسموح (20MB)"},{status:413});
 const bytes=Buffer.from(await file.arrayBuffer());
 const detected=await fileTypeFromBuffer(bytes);
 if(!detected||!ALLOWED.has(detected.mime))return NextResponse.json({error:"نوع الملف غير مدعوم أو لا يطابق محتواه الفعلي"},{status:415});
 const {workspaceId}=await context.params;
 try{
  const asset=await withWorkspace(user.id,workspaceId,WRITE_ROLES,async tx=>{
   const storageKey=await saveMediaFile(bytes,detected.ext);
   try{
    const created=await tx.mediaAsset.create({data:{
     workspaceId,createdById:user.id,storageKey,
     originalName:file.name.replace(/[^\p{L}\p{N}._ -]/gu,"_").slice(0,180)||"media",
     mimeType:detected.mime,sizeBytes:bytes.byteLength,
     sha256:createHash("sha256").update(bytes).digest("hex")
    }});
    await tx.auditEvent.create({data:{workspaceId,actorId:user.id,action:"media.uploaded",targetType:"media",targetId:created.id,metadata:{mimeType:created.mimeType,sizeBytes:created.sizeBytes}}});
    return created;
   }catch(error){await deleteMediaFile(storageKey);throw error;}
  });
  return NextResponse.json({asset},{status:201});
 }catch(e){if(e instanceof AccessDeniedError)return NextResponse.json({error:"لا تملك صلاحية رفع الملفات"},{status:403});throw e;}
}
