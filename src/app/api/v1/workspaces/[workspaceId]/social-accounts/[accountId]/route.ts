import {NextRequest,NextResponse} from "next/server";
import {isSameOrigin} from "@/lib/request-security";
import {getCurrentUser} from "@/lib/auth";
import {AccessDeniedError,WRITE_ROLES,withWorkspace} from "@/lib/tenant";
type Context={params:Promise<{workspaceId:string;accountId:string}>};
export async function DELETE(request:NextRequest,context:Context){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:"غير مصرح"},{status:401});
 if(!isSameOrigin(request))return NextResponse.json({error:"طلب غير صالح"},{status:403});
 const {workspaceId,accountId}=await context.params;
 try{const removed=await withWorkspace(user.id,workspaceId,WRITE_ROLES,async tx=>{
  const current=await tx.socialAccount.findFirst({where:{id:accountId,workspaceId}});if(!current)return false;
  await tx.socialAccount.delete({where:{id:accountId}});
  await tx.auditEvent.create({data:{workspaceId,actorId:user.id,action:"social_account.deleted",targetType:"social_account",targetId:accountId}});
  return true;
 });return removed?NextResponse.json({ok:true}):NextResponse.json({error:"الحساب غير موجود"},{status:404});}
 catch(e){if(e instanceof AccessDeniedError)return NextResponse.json({error:"لا تملك صلاحية الحذف"},{status:403});throw e;}
}
