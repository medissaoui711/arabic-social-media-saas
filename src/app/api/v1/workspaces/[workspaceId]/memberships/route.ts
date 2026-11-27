import {NextRequest,NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/auth";
import {AccessDeniedError,withWorkspace} from "@/lib/tenant";
type Context={params:Promise<{workspaceId:string}>};
export async function GET(_request:NextRequest,context:Context){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:"غير مصرح"},{status:401});
 const {workspaceId}=await context.params;
 try{
  const memberships=await withWorkspace(user.id,workspaceId,null,tx=>tx.membership.findMany({
   where:{workspaceId},include:{user:{select:{id:true,email:true,displayName:true}}},orderBy:{createdAt:"asc"}
  }));
  return NextResponse.json({memberships});
 }catch(e){if(e instanceof AccessDeniedError)return NextResponse.json({error:"لا تملك صلاحية الوصول"},{status:403});throw e;}
}
