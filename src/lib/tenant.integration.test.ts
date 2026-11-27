import {afterAll,describe,expect,it} from "vitest";
import {randomUUID} from "node:crypto";
import {prisma} from "./prisma";
import {withWorkspace,AccessDeniedError} from "./tenant";

const run=Boolean(process.env.DATABASE_URL);
describe.skipIf(!run)("PostgreSQL tenant isolation",()=>{
 const userId=randomUUID(),workspaceA=randomUUID(),workspaceB=randomUUID();
 const email=`tenant-test-${userId}@example.invalid`;
 afterAll(async()=>{
  await prisma.workspace.deleteMany({where:{id:{in:[workspaceA,workspaceB]}}});
  await prisma.user.deleteMany({where:{id:userId}});
 });
 it("isolates workspace rows and clears transaction-local context on pooled connections",async()=>{
  await prisma.user.create({data:{id:userId,email,passwordHash:"not-used-in-this-test",displayName:"Tenant test"}});
  await prisma.workspace.createMany({data:[{id:workspaceA,name:"Tenant A"},{id:workspaceB,name:"Tenant B"}]});
  await prisma.$transaction(async tx=>{
   await tx.$queryRaw`SELECT set_config('app.current_workspace_id',${workspaceA},true)`;
   await tx.membership.create({data:{workspaceId:workspaceA,userId,role:"OWNER"}});
  });
  await withWorkspace(userId,workspaceA,["OWNER"],async tx=>{
   await tx.contentItem.create({data:{workspaceId:workspaceA,createdById:userId,title:"Private A",body:""}});
  });
  await expect(withWorkspace(userId,workspaceB,null,async()=>true)).rejects.toBeInstanceOf(AccessDeniedError);
  const unscoped=await prisma.contentItem.findMany();
  expect(unscoped).toHaveLength(0);
  const scoped=await withWorkspace(userId,workspaceA,null,tx=>tx.contentItem.findMany({where:{workspaceId:workspaceA}}));
  expect(scoped).toHaveLength(1);
 });
});
