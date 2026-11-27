import {describe,expect,it} from "vitest";
import {detectAllowedMedia} from "./media-validation";
describe("uploaded media content validation",()=>{
 it("rejects arbitrary text renamed as an image",async()=>{
  expect(await detectAllowedMedia(Buffer.from("not really a png"))).toBeNull();
 });
 it("rejects empty buffers",async()=>{
  expect(await detectAllowedMedia(Buffer.alloc(0))).toBeNull();
 });
});
