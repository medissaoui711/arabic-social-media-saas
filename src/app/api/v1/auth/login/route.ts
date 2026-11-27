import {NextRequest,NextResponse} from "next/server";
import {isSameOrigin} from "@/lib/request-security";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {createSession} from "@/lib/auth";
import {hashSessionToken,normalizeEmail,verifyPassword} from "@/lib/security";
const schema=z.object({email:z.string().email().max(320),password:z.string().min(1).max(256)});
const WINDOW_MS=15*60*1000,MAX_ATTEMPTS=10;
export async function POST(request:NextRequest){
 if(!isSameOrigin(request))return NextResponse.json({error:"طلب غير صالح"},{status:403});
 const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"بيانات الدخول غير صالحة"},{status:400});
 const email=normalizeEmail(parsed.data.email),key=hashSessionToken("login:"+email),now=new Date();
 let state=await prisma.authRateLimit.findUnique({where:{key}});
 if(state&&now.getTime()-state.windowStartedAt.getTime()>WINDOW_MS){
  await prisma.authRateLimit.update({where:{key},data:{attempts:0,windowStartedAt:now,blockedUntil:null}});
  state=null;
 }
 if(state&&(state.blockedUntil&&state.blockedUntil>now||state.attempts>=MAX_ATTEMPTS)){
  if(!state.blockedUntil)await prisma.authRateLimit.update({where:{key},data:{blockedUntil:new Date(now.getTime()+WINDOW_MS)}});
  return NextResponse.json({error:"محاولات كثيرة. حاول مرة أخرى بعد 15 دقيقة."},{status:429});
 }
 const user=await prisma.user.findUnique({where:{email}});
 const valid=!!user&&!user.disabledAt&&await verifyPassword(user.passwordHash,parsed.data.password);
 if(!valid){
  const updated=await prisma.authRateLimit.upsert({where:{key},create:{key,attempts:1,windowStartedAt:now},update:{attempts:{increment:1}}});
  if(updated.attempts>=MAX_ATTEMPTS)await prisma.authRateLimit.update({where:{key},data:{blockedUntil:new Date(now.getTime()+WINDOW_MS)}});
  return NextResponse.json({error:"البريد الإلكتروني أو كلمة المرور غير صحيحة"},{status:401});
 }
 await prisma.authRateLimit.deleteMany({where:{key}});
 await createSession(user.id);
 return NextResponse.json({ok:true});
}
