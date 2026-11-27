import {NextRequest,NextResponse} from "next/server";
import {isSameOrigin} from "@/lib/request-security";
import {getCurrentUser} from "@/lib/auth";
import {AccessDeniedError,WRITE_ROLES,withWorkspace} from "@/lib/tenant";
type Context={params:Promise<{workspaceId:string;scheduleId:string}>};
export async function PATCH(request:NextRequest,context:Context){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:"غير مصرح"},{status:401});
 if(!isSameOrigin(request))return NextResponse.json({error:"طلب غير صالح"},{status:403});
 const body=await request.json().catch(()=>null);
 if(!body||!["cancel","complete"].includes(body.action))return NextResponse.json({error:"الإجراء غير صالح"},{status:400});
 const {workspaceId,scheduleId}=await context.params;
 try{
  const job=await withWorkspace(user.id,workspaceId,WRITE_ROLES,async tx=>{
   const current=await tx.scheduleJob.findFirst({where:{id:scheduleId,workspaceId}});
   if(!current)return null;
   const target=body.action==="cancel"?"cancelled":"completed";
   if((target==="cancelled"&&current.status!=="scheduled")||(target==="completed"&&current.status!=="due"))throw new Error("INVALID_TRANSITION");
   const updated=await tx.scheduleJob.update({where:{id:scheduleId},data:{status:target,completedAt:target==="completed"?new Date():null}});
   await tx.scheduleEvent.create({data:{workspaceId,scheduleId,fromStatus:current.status,toStatus:target,detail:{actorId:user.id}}});
   await tx.auditEvent.create({data:{workspaceId,actorId:user.id,action:"schedule."+target,targetType:"schedule",targetId:scheduleId}});
   return updated;
  });
  if(!job)return NextResponse.json({error:"موعد الجدولة غير موجود"},{status:404});return NextResponse.json({job});
 }catch(e){
  if(e instanceof AccessDeniedError)return NextResponse.json({error:"لا تملك صلاحية التعديل"},{status:403});
  if(e instanceof Error&&e.message==="INVALID_TRANSITION")return NextResponse.json({error:"انتقال الحالة غير مسموح"},{status:409});
  throw e;
 }
}
