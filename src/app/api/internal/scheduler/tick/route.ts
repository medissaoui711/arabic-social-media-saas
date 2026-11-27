import {NextRequest,NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {safeEqual} from "@/lib/security";
export async function POST(request:NextRequest){
 const expected=process.env.SCHEDULER_TOKEN??"",provided=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"")??"";
 if(expected.length<32||!safeEqual(expected,provided))return NextResponse.json({error:"غير مصرح"},{status:401});
 const workspaces=await prisma.workspace.findMany({select:{id:true}});
 let claimed=0;
 for(const workspace of workspaces){
  const count=await prisma.$transaction(async tx=>{
   await tx.$queryRaw`SELECT set_config('app.current_workspace_id',${workspace.id},true)`;
   const rows=await tx.$queryRaw<Array<{id:string}>>`
    UPDATE schedule_jobs SET status='due',claimed_at=now(),attempt_count=attempt_count+1,updated_at=now()
    WHERE id IN (
     SELECT id FROM schedule_jobs
     WHERE workspace_id=${workspace.id}::uuid AND status='scheduled' AND scheduled_at<=now()
     ORDER BY scheduled_at FOR UPDATE SKIP LOCKED LIMIT 50
    ) RETURNING id
   `;
   for(const row of rows){
    await tx.scheduleEvent.create({data:{workspaceId:workspace.id,scheduleId:row.id,fromStatus:"scheduled",toStatus:"due",detail:{worker:"internal-scheduler"}}});
    await tx.auditEvent.create({data:{workspaceId:workspace.id,action:"schedule.due",targetType:"schedule",targetId:row.id}});
   }
   return rows.length;
  });
  claimed+=count;
 }
 return NextResponse.json({claimed,workspaces:workspaces.length});
}
