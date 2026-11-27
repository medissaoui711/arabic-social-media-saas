import {NextRequest,NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/auth";
import {contentInput} from "@/lib/content";
import {AccessDeniedError,WRITE_ROLES,withWorkspace} from "@/lib/tenant";
type Context={params:Promise<{workspaceId:string}>};
export async function GET(_request:NextRequest,context:Context){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:"غير مصرح"},{status:401});
 const {workspaceId}=await context.params;
 try{const items=await withWorkspace(user.id,workspaceId,null,tx=>tx.contentItem.findMany({where:{workspaceId},orderBy:{updatedAt:"desc"},take:100}));return NextResponse.json({items});}
 catch(e){if(e instanceof AccessDeniedError)return NextResponse.json({error:"لا تملك صلاحية الوصول"},{status:403});throw e;}
}
export async function POST(request:NextRequest,context:Context){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:"غير مصرح"},{status:401});
 if(request.headers.get("origin")!==new URL(request.url).origin)return NextResponse.json({error:"طلب غير صالح"},{status:403});
 const parsed=contentInput.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"تحقق من عنوان ونص المحتوى",details:parsed.error.flatten()},{status:400});
 const {workspaceId}=await context.params;
 try{
  const item=await withWorkspace(user.id,workspaceId,WRITE_ROLES,async tx=>{
   const created=await tx.contentItem.create({data:{...parsed.data,workspaceId,createdById:user.id}});
   await tx.auditEvent.create({data:{workspaceId,actorId:user.id,action:"content.created",targetType:"content",targetId:created.id,metadata:{status:created.status}}});
   return created;
  });
  return NextResponse.json({item},{status:201});
 }catch(e){if(e instanceof AccessDeniedError)return NextResponse.json({error:"لا تملك صلاحية التعديل"},{status:403});throw e;}
}
