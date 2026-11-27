import {NextRequest,NextResponse} from "next/server";
import {isSameOrigin} from "@/lib/request-security";
import {getCurrentUser} from "@/lib/auth";
import {contentUpdate} from "@/lib/content";
import {AccessDeniedError,WRITE_ROLES,withWorkspace} from "@/lib/tenant";
type Context={params:Promise<{workspaceId:string;contentId:string}>};
export async function PATCH(request:NextRequest,context:Context){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:"غير مصرح"},{status:401});
 if(!isSameOrigin(request))return NextResponse.json({error:"طلب غير صالح"},{status:403});
 const body=await request.json().catch(()=>null),parsed=contentUpdate.safeParse(body);
 if(!parsed.success)return NextResponse.json({error:"بيانات تحديث المحتوى غير صالحة"},{status:400});
 const {workspaceId,contentId}=await context.params;
 try{
  const item=await withWorkspace(user.id,workspaceId,WRITE_ROLES,async tx=>{
   const current=await tx.contentItem.findFirst({where:{id:contentId,workspaceId}});if(!current)return null;
   const updated=await tx.contentItem.update({where:{id:contentId},data:parsed.data});
   await tx.auditEvent.create({data:{workspaceId,actorId:user.id,action:"content.updated",targetType:"content",targetId:contentId,metadata:{fromStatus:current.status,toStatus:updated.status,changedFields:Object.keys(parsed.data)}}});
   return updated;
  });
  if(!item)return NextResponse.json({error:"المحتوى غير موجود"},{status:404});return NextResponse.json({item});
 }catch(e){if(e instanceof AccessDeniedError)return NextResponse.json({error:"لا تملك صلاحية التعديل"},{status:403});throw e;}
}
