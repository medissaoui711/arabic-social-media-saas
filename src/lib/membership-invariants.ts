import type {WorkspaceRole} from "@prisma/client";
export function assertWorkspaceOwnerRemains(currentRole:WorkspaceRole,ownerCount:number,nextRole?:WorkspaceRole){
 if(currentRole==="OWNER"&&ownerCount<=1&&nextRole!=="OWNER")throw new Error("LAST_OWNER");
}
