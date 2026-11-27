import {describe,expect,it} from "vitest";
import {contentInput,contentStatus,contentUpdate} from "./content";
describe("content lifecycle",()=>{
 it("allows only approved statuses",()=>{for(const s of ["draft","ready","archived"])expect(contentStatus.safeParse(s).success).toBe(true);expect(contentStatus.safeParse("published").success).toBe(false);});
 it("rejects empty and oversized titles",()=>{expect(contentInput.safeParse({title:" "}).success).toBe(false);expect(contentInput.safeParse({title:"x".repeat(181)}).success).toBe(false);});
 it("trims title and defaults to draft",()=>{expect(contentInput.parse({title:"  حملة جديدة "})).toMatchObject({title:"حملة جديدة",status:"draft",body:""});});
 it("accepts partial edits but rejects empty updates",()=>{expect(contentUpdate.safeParse({body:"نص معدل"}).success).toBe(true);expect(contentUpdate.safeParse({}).success).toBe(false);});
});
