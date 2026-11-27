import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {hashPassword,normalizeEmail,safeEqual} from "@/lib/security";
const schema=z.object({token:z.string().min(32).max(512),email:z.string().email().max(320),password:z.string().min(12).max(128),displayName:z.string().trim().min(2).max(120),workspaceName:z.string().trim().min(2).max(120)});
export async function POST(request:NextRequest){
 if(request.headers.get("origin")!==new URL(request.url).origin)return NextResponse.json({error:"طلب غير صالح"},{status:403});
 const input=schema.safeParse(await request.json().catch(()=>null)),expected=process.env.BOOTSTRAP_TOKEN??"";
 if(!input.success||expected.length<32||!safeEqual(input.data.token,expected))return NextResponse.json({error:"غير مصرح"},{status:403});
 if(await prisma.user.count()!==0)return NextResponse.json({error:"تم إغلاق التهيئة الأولية"},{status:409});
 const passwordHash=await hashPassword(input.data.password);
 try{
  const result=await prisma.$transaction(async tx=>{
   if(await tx.user.count()!==0)throw new Error("BOOTSTRAP_CLOSED");
   const user=await tx.user.create({data:{email:normalizeEmail(input.data.email),passwordHash,displayName:input.data.displayName}});
   const workspace=await tx.workspace.create({data:{name:input.data.workspaceName}});
   await tx.$executeRaw`SELECT set_config('app.current_workspace_id',${workspace.id},true)`;
   await tx.membership.create({data:{userId:user.id,workspaceId:workspace.id,role:"OWNER"}});
   await tx.auditEvent.create({data:{workspaceId:workspace.id,actorId:user.id,action:"workspace.bootstrap",targetType:"workspace",targetId:workspace.id}});
   return {userId:user.id,workspaceId:workspace.id};
  },{isolationLevel:"Serializable"});
  return NextResponse.json({ok:true,...result},{status:201});
 }catch{return NextResponse.json({error:"تعذر إكمال التهيئة؛ تحقق من أن النظام لم تتم تهيئته سابقاً"},{status:409});}
}
