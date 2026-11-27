import {Temporal} from "@js-temporal/polyfill";
export function resolveLocalSchedule(localDateTime:string,timeZone:string,now=new Date()){
 const instant=Temporal.PlainDateTime.from(localDateTime).toZonedDateTime(timeZone,{disambiguation:"reject"}).toInstant();
 const scheduledAt=new Date(instant.toString());
 if(scheduledAt<=now)throw new Error("SCHEDULE_MUST_BE_FUTURE");
 return {scheduledAt,timeZone,instant:instant.toString()};
}
