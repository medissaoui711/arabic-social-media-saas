import {NextRequest,NextResponse} from "next/server";
import {isSameOrigin} from "@/lib/request-security";
import {assertWorkspaceOwnerRemains} from "@/lib/membership-invariants";
import {z} from "zod";
import {getCurrentUser} from "@/lib/auth";
import {AccessDeniedError,withWorkspace} from "@/lib/tenant";
const roleSchema=z.enum(["OWNER","ADMIN","EDITOR","VIEWER"]);
type Context={params:Promise<{workspaceId:string;membershipId:string}>};
export async function PATCH(request:NextRequest,context:Context){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:"غير مصرح"},{status:401});
 if(!isSameOrigin(request))return NextResponse.json({error:"طلب غير صالح"},{status:403});
 const parsed=roleSchema.safeParse((await request.json().catch(()=>null))?.role);if(!parsed.success)return NextResponse.json({error:"الدور غير صالح"},{status:400});
 const {workspaceId,membershipId}=await context.params;
 try{
  const updated=await withWorkspace(user.id,workspaceId,["OWNER"],async tx=>{
   await tx.$queryRaw`SELECT id FROM memberships WHERE workspace_id=${workspaceId}::uuid AND role='OWNER'::"WorkspaceRole" FOR UPDATE`;
   const target=await tx.membership.findFirst({where:{id:membershipId,workspaceId}});if(!target)return null;
   if(target.role==="OWNER"){
    const owners=await tx.membership.count({where:{workspaceId,role:"OWNER"}});
    assertWorkspaceOwnerRemains(target.role,owners,parsed.data);
   }
   const result=await tx.membership.update({where:{id:membershipId},data:{role:parsed.data}});
   await tx.auditEvent.create({data:{workspaceId,actorId:user.id,action:"membership.role_changed",targetType:"membership",targetId:membershipId,metadata:{from:target.role,to:parsed.data}}});
   return result;
  });
  if(!updated)return NextResponse.json({error:"العضوية غير موجودة"},{status:404});return NextResponse.json({membership:updated});
 }catch(e){
  if(e instanceof AccessDeniedError)return NextResponse.json({error:"يتطلب تغيير الأدوار صلاحية المالك"},{status:403});
  if(e instanceof Error&&e.message==="LAST_OWNER")return NextResponse.json({error:"لا يمكن إزالة أو تخفيض صلاحية المالك الأخير"},{status:409});
  throw e;
 }
}
export async function DELETE(request:NextRequest,context:Context){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:"غير مصرح"},{status:401});
 if(!isSameOrigin(request))return NextResponse.json({error:"طلب غير صالح"},{status:403});
 const {workspaceId,membershipId}=await context.params;
 try{
  const removed=await withWorkspace(user.id,workspaceId,["OWNER"],async tx=>{
   await tx.$queryRaw`SELECT id FROM memberships WHERE workspace_id=${workspaceId}::uuid AND role='OWNER'::"WorkspaceRole" FOR UPDATE`;
   const target=await tx.membership.findFirst({where:{id:membershipId,workspaceId}});if(!target)return false;
   if(target.role==="OWNER")assertWorkspaceOwnerRemains(target.role,await tx.membership.count({where:{workspaceId,role:"OWNER"}}));
   await tx.membership.delete({where:{id:membershipId}});
   await tx.auditEvent.create({data:{workspaceId,actorId:user.id,action:"membership.removed",targetType:"membership",targetId:membershipId,metadata:{removedUserId:target.userId,removedRole:target.role}}});
   return true;
  });
  return removed?NextResponse.json({ok:true}):NextResponse.json({error:"العضوية غير موجودة"},{status:404});
 }catch(e){
  if(e instanceof AccessDeniedError)return NextResponse.json({error:"يتطلب حذف العضوية صلاحية المالك"},{status:403});
  if(e instanceof Error&&e.message==="LAST_OWNER")return NextResponse.json({error:"لا يمكن حذف المالك الأخير"},{status:409});
  throw e;
 }
}
