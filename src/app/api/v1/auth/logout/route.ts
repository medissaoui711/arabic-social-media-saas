import {NextRequest,NextResponse} from "next/server";
import {destroyCurrentSession} from "@/lib/auth";
export async function POST(request:NextRequest){
 if(request.headers.get("origin")!==new URL(request.url).origin)return NextResponse.json({error:"طلب غير صالح"},{status:403});
 await destroyCurrentSession();return NextResponse.json({ok:true});
}
