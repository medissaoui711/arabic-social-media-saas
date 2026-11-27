import {z} from "zod";
export const contentInput=z.object({title:z.string().trim().min(1).max(180),body:z.string().max(30000).default(""),status:z.enum(["draft","ready","archived"]).default("draft")});
export const contentStatus=z.enum(["draft","ready","archived"]);

export const contentUpdate=z.object({title:z.string().trim().min(1).max(180).optional(),body:z.string().max(30000).optional(),status:contentStatus.optional()}).refine(v=>Object.keys(v).length>0);
