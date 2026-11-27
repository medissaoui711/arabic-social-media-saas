import "server-only";
import type {NextRequest} from "next/server";
export function isSameOrigin(request:NextRequest):boolean{
 const origin=request.headers.get("origin");
 if(!origin)return false;
 try{
  const expected=process.env.APP_ORIGIN??new URL(request.url).origin;
  return new URL(origin).origin===new URL(expected).origin;
 }catch{return false;}
}
