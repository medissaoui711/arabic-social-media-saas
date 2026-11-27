import "server-only";
import { Prisma,WorkspaceRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
export class AccessDeniedError extends Error {}
export const WRITE_ROLES:WorkspaceRole[]=["OWNER","ADMIN","EDITOR"];
export async function withWorkspace<T>(userId:string,workspaceId:string,roles:WorkspaceRole[]|null,operation:(tx:Prisma.TransactionClient,role:WorkspaceRole)=>Promise<T>):Promise<T>{
 return prisma.$transaction(async tx=>{
  // Transaction-local setting prevents tenant context leaking through pooled connections.
  await tx.$executeRaw`SELECT set_config('app.current_workspace_id',${workspaceId},true)`;
  const membership=await tx.membership.findUnique({where:{workspaceId_userId:{workspaceId,userId}}});
  if(!membership||(roles&&!roles.includes(membership.role)))throw new AccessDeniedError("Workspace access denied");
  return operation(tx,membership.role);
 },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable,maxWait:5000,timeout:10000});
}
