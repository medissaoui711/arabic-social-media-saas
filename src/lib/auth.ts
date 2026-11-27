import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashSessionToken,newSessionToken } from "@/lib/security";
export const SESSION_COOKIE="asms_session";
const ttlDays=Math.min(Math.max(Number(process.env.SESSION_TTL_DAYS??14),1),30);
export async function createSession(userId:string) {
 const token=newSessionToken(),expiresAt=new Date(Date.now()+ttlDays*86400_000);
 await prisma.session.create({data:{tokenHash:hashSessionToken(token),userId,expiresAt}});
 const jar=await cookies(); jar.set(SESSION_COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",expires:expiresAt});
}
export async function getCurrentUser() {
 const jar=await cookies(),token=jar.get(SESSION_COOKIE)?.value; if(!token)return null;
 const s=await prisma.session.findUnique({where:{tokenHash:hashSessionToken(token)},include:{user:{select:{id:true,email:true,displayName:true,disabledAt:true}}}});
 if(!s||s.expiresAt<=new Date()||s.user.disabledAt)return null;
 return {id:s.user.id,email:s.user.email,displayName:s.user.displayName,sessionId:s.id};
}
export async function destroyCurrentSession() {
 const jar=await cookies(),token=jar.get(SESSION_COOKIE)?.value;
 if(token)await prisma.session.deleteMany({where:{tokenHash:hashSessionToken(token)}});
 jar.delete(SESSION_COOKIE);
}
