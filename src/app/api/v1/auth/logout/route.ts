import {NextRequest,NextResponse} from "next/server";
import {isSameOrigin} from "@/lib/request-security";
import {destroyCurrentSession} from "@/lib/auth";
export async function POST(request:NextRequest){
 if(!isSameOrigin(request))return NextResponse.json({error:"طلب غير صالح"},{status:403});
 await destroyCurrentSession();return NextResponse.json({ok:true});
}
