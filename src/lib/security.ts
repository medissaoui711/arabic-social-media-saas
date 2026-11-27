import "server-only";
import {createHash,randomBytes,timingSafeEqual} from "node:crypto";
import argon2 from "argon2";
export const hashPassword=(password:string)=>argon2.hash(password,{type:argon2.argon2id,memoryCost:19456,timeCost:2,parallelism:1});
export const verifyPassword=(hash:string,password:string)=>argon2.verify(hash,password);
export const newSessionToken=()=>randomBytes(32).toString("base64url");
export const hashSessionToken=(token:string)=>createHash("sha256").update(token).digest("hex");
export function safeEqual(a:string,b:string):boolean{const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
export const normalizeEmail=(email:string)=>email.trim().toLowerCase();
