import {NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/auth";
import {prisma} from "@/lib/prisma";
export async function GET(){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:"غير مصرح"},{status:401});
 const memberships=await prisma.$transaction(async tx=>{
  await tx.$executeRaw`SELECT set_config('app.current_user_id',${user.id},true)`;
  return tx.membership.findMany({where:{userId:user.id},include:{workspace:{select:{id:true,name:true}}},orderBy:{createdAt:"asc"}});
 });
 return NextResponse.json({user:{id:user.id,email:user.email,displayName:user.displayName},workspaces:memberships.map(m=>({...m.workspace,role:m.role}))});
}
