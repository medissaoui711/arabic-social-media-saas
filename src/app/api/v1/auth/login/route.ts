import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {createSession} from "@/lib/auth";
import {normalizeEmail,verifyPassword} from "@/lib/security";
const schema=z.object({email:z.string().email().max(320),password:z.string().min(1).max(256)});
export async function POST(request:NextRequest){
 if(request.headers.get("origin")!==new URL(request.url).origin)return NextResponse.json({error:"طلب غير صالح"},{status:403});
 const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"بيانات الدخول غير صالحة"},{status:400});
 const user=await prisma.user.findUnique({where:{email:normalizeEmail(parsed.data.email)}});
 const valid=user&&!user.disabledAt&&await verifyPassword(user.passwordHash,parsed.data.password);
 if(!valid)return NextResponse.json({error:"البريد الإلكتروني أو كلمة المرور غير صحيحة"},{status:401});
 await createSession(user.id);return NextResponse.json({ok:true});
}
