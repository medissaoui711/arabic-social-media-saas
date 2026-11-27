import {describe,expect,it} from "vitest";
import {assertWorkspaceOwnerRemains} from "./membership-invariants";
describe("workspace owner invariant",()=>{
 it("prevents demoting the last owner",()=>expect(()=>assertWorkspaceOwnerRemains("OWNER",1,"ADMIN")).toThrow("LAST_OWNER"));
 it("prevents removing the last owner",()=>expect(()=>assertWorkspaceOwnerRemains("OWNER",1)).toThrow("LAST_OWNER"));
 it("allows demotion when another owner remains",()=>expect(()=>assertWorkspaceOwnerRemains("OWNER",2,"ADMIN")).not.toThrow());
 it("does not block changes to non-owner memberships",()=>expect(()=>assertWorkspaceOwnerRemains("EDITOR",0,"VIEWER")).not.toThrow());
});
