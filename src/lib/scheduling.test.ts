import {describe,expect,it} from "vitest";
import {resolveLocalSchedule} from "./scheduling";
describe("IANA schedule time resolution",()=>{
 it("converts a valid local time to a UTC instant",()=>{
  const r=resolveLocalSchedule("2026-06-10T10:30","Asia/Qatar",new Date("2026-06-01T00:00:00Z"));
  expect(r.scheduledAt.toISOString()).toBe("2026-06-10T07:30:00.000Z");
  expect(r.timeZone).toBe("Asia/Qatar");
 });
 it("rejects nonexistent local times in a DST gap",()=>{
  expect(()=>resolveLocalSchedule("2026-03-08T02:30","America/New_York",new Date("2026-01-01T00:00:00Z"))).toThrow();
 });
 it("rejects ambiguous local times in a DST fold",()=>{
  expect(()=>resolveLocalSchedule("2026-11-01T01:30","America/New_York",new Date("2026-01-01T00:00:00Z"))).toThrow();
 });
 it("rejects past schedules",()=>{
  expect(()=>resolveLocalSchedule("2026-01-01T10:00","Asia/Qatar",new Date("2026-01-02T00:00:00Z"))).toThrow("SCHEDULE_MUST_BE_FUTURE");
 });
});
