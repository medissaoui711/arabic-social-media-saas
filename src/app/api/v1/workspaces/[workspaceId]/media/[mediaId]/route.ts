import {NextRequest,NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/auth";
import {AccessDeniedError,withWorkspace} from "@/lib/tenant";
import {readMediaFile} from "@/lib/media-storage";
type Context={params:Promise<{workspaceId:string;mediaId:string}>};
export async function GET(_request:NextRequest,context:Context){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:"غير مصرح"},{status:401});
 const {workspaceId,mediaId}=await context.params;
 try{
  const asset=await withWorkspace(user.id,workspaceId,null,tx=>tx.mediaAsset.findFirst({where:{id:mediaId,workspaceId}}));
  if(!asset)return NextResponse.json({error:"الملف غير موجود"},{status:404});
  const bytes=await readMediaFile(asset.storageKey);
  return new NextResponse(new Uint8Array(bytes),{headers:{
   "Content-Type":asset.mimeType,"Content-Length":String(asset.sizeBytes),
   "Content-Disposition":"attachment; filename=\"media\"",
   "X-Content-Type-Options":"nosniff","Cache-Control":"private, no-store",
   "Content-Security-Policy":"sandbox"
  }});
 }catch(e){if(e instanceof AccessDeniedError)return NextResponse.json({error:"لا تملك صلاحية الوصول"},{status:403});throw e;}
}
