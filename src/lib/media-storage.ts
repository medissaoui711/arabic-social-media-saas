import "server-only";
import {mkdir,readFile,unlink,writeFile} from "node:fs/promises";
import {join,resolve} from "node:path";
import {randomUUID} from "node:crypto";
const root=resolve(process.cwd(),process.env.MEDIA_STORAGE_DIR??"var/uploads");
const allowedExtensions=new Set(["jpg","png","webp","mp4"]);
export async function saveMediaFile(bytes:Buffer,extension:string){
 if(!allowedExtensions.has(extension))throw new Error("Unsupported media extension");
 await mkdir(root,{recursive:true});
 const key=`${randomUUID()}.${extension}`;
 await writeFile(join(root,key),bytes,{flag:"wx",mode:0o600});
 return key;
}
export async function readMediaFile(key:string){
 if(!/^[0-9a-f-]{36}\.(jpg|png|webp|mp4)$/.test(key))throw new Error("Invalid storage key");
 return readFile(join(root,key));
}
export async function deleteMediaFile(key:string){
 if(!/^[0-9a-f-]{36}\.(jpg|png|webp|mp4)$/.test(key))return;
 await unlink(join(root,key)).catch(()=>undefined);
}
