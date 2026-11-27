import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {getCurrentUser} from "@/lib/auth";
import {AccessDeniedError,WRITE_ROLES,withWorkspace} from "@/lib/tenant";
const schema=z.object({platform:z.enum(["facebook","instagram","tiktok","youtube","linkedin","x","other"]),accountName:z.string().trim().min(1).max(120),handle:z.string().trim().min(1).max(120),notes:z.string().max(1000).optional()});
type Context={params:Promise<{workspaceId:string}>};
export async function GET(_request:NextRequest,context:Context){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:"غير مصرح"},{status:401});
 const {workspaceId}=await context.params;
 try{const accounts=await withWorkspace(user.id,workspaceId,null,tx=>tx.socialAccount.findMany({where:{workspaceId},orderBy:{createdAt:"desc"}}));return NextResponse.json({accounts});}
 catch(e){if(e instanceof AccessDeniedError)return NextResponse.json({error:"لا تملك صلاحية الوصول"},{status:403});throw e;}
}
export async function POST(request:NextRequest,context:Context){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:"غير مصرح"},{status:401});
 if(request.headers.get("origin")!==new URL(request.url).origin)return NextResponse.json({error:"طلب غير صالح"},{status:403});
 const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"بيانات الحساب غير صالحة"},{status:400});
 const {workspaceId}=await context.params;
 try{const account=await withWorkspace(user.id,workspaceId,WRITE_ROLES,async tx=>{
  const created=await tx.socialAccount.create({data:{...parsed.data,workspaceId}});
  await tx.auditEvent.create({data:{workspaceId,actorId:user.id,action:"social_account.created",targetType:"social_account",targetId:created.id,metadata:{platform:created.platform}}});
  return created;
 });return NextResponse.json({account},{status:201});}
 catch(e){if(e instanceof AccessDeniedError)return NextResponse.json({error:"لا تملك صلاحية التعديل"},{status:403});if(e instanceof Error&&"code" in e&&e.code==="P2002")return NextResponse.json({error:"هذا الحساب مسجل بالفعل في مساحة العمل"},{status:409});throw e;}
}
