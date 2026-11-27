import {NextRequest,NextResponse} from "next/server";
import {isSameOrigin} from "@/lib/request-security";
import {resolveLocalSchedule} from "@/lib/scheduling";
import {z} from "zod";
import {getCurrentUser} from "@/lib/auth";
import {AccessDeniedError,WRITE_ROLES,withWorkspace} from "@/lib/tenant";
const schema=z.object({contentId:z.string().uuid(),localDateTime:z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),timeZone:z.string().min(1).max(64),idempotencyKey:z.string().min(8).max(128)});
type Context={params:Promise<{workspaceId:string}>};
export async function GET(_request:NextRequest,context:Context){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:"غير مصرح"},{status:401});
 const {workspaceId}=await context.params;
 try{const schedules=await withWorkspace(user.id,workspaceId,null,tx=>tx.scheduleJob.findMany({where:{workspaceId},include:{content:{select:{title:true}},events:{orderBy:{createdAt:"asc"}}},orderBy:{scheduledAt:"asc"},take:200}));return NextResponse.json({schedules});}
 catch(e){if(e instanceof AccessDeniedError)return NextResponse.json({error:"لا تملك صلاحية الوصول"},{status:403});throw e;}
}
export async function POST(request:NextRequest,context:Context){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:"غير مصرح"},{status:401});
 if(!isSameOrigin(request))return NextResponse.json({error:"طلب غير صالح"},{status:403});
 const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"بيانات الجدولة غير صالحة",details:parsed.error.flatten()},{status:400});
 let resolved:{scheduledAt:Date;timeZone:string;instant:string};
 try{resolved=resolveLocalSchedule(parsed.data.localDateTime,parsed.data.timeZone);}
 catch{return NextResponse.json({error:"الوقت المحلي غير صالح أو ملتبس بسبب التوقيت الصيفي أو ليس وقتاً مستقبلياً؛ اختر وقتاً واضحاً ومنطقة زمنية IANA صحيحة"},{status:422});}
 const scheduledAt=resolved.scheduledAt;
 const {workspaceId}=await context.params;
 try{
  const result=await withWorkspace(user.id,workspaceId,WRITE_ROLES,async tx=>{
   const duplicate=await tx.scheduleJob.findUnique({where:{workspaceId_idempotencyKey:{workspaceId,idempotencyKey:parsed.data.idempotencyKey}}});
   if(duplicate){
    if(duplicate.contentId!==parsed.data.contentId||duplicate.scheduledAt.getTime()!==scheduledAt.getTime()||duplicate.timezone!==parsed.data.timeZone)throw new Error("IDEMPOTENCY_CONFLICT");
    return {job:duplicate,replayed:true};
   }
   const content=await tx.contentItem.findFirst({where:{id:parsed.data.contentId,workspaceId}});
   if(!content)throw new Error("CONTENT_NOT_FOUND");
   if(content.status!=="ready")throw new Error("CONTENT_NOT_READY");
   const job=await tx.scheduleJob.create({data:{workspaceId,contentId:content.id,scheduledAt,timezone:parsed.data.timeZone,idempotencyKey:parsed.data.idempotencyKey}});
   await tx.scheduleEvent.create({data:{workspaceId,scheduleId:job.id,toStatus:"scheduled",detail:{localDateTime:parsed.data.localDateTime,timeZone:parsed.data.timeZone}}});
   await tx.auditEvent.create({data:{workspaceId,actorId:user.id,action:"schedule.created",targetType:"schedule",targetId:job.id}});
   return {job,replayed:false};
  });
  return NextResponse.json(result,{status:result.replayed?200:201});
 }catch(e){
  if(e instanceof AccessDeniedError)return NextResponse.json({error:"لا تملك صلاحية الجدولة"},{status:403});
  if(e instanceof Error&&e.message==="IDEMPOTENCY_CONFLICT")return NextResponse.json({error:"مفتاح منع التكرار مستخدم لطلب مختلف"},{status:409});
  if(e instanceof Error&&e.message==="CONTENT_NOT_FOUND")return NextResponse.json({error:"المحتوى غير موجود"},{status:404});
  if(e instanceof Error&&e.message==="CONTENT_NOT_READY")return NextResponse.json({error:"يجب أن تكون حالة المحتوى جاهزاً قبل جدولته"},{status:409});
  throw e;
 }
}
