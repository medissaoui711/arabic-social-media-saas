import {fileTypeFromBuffer} from "file-type";
export const ALLOWED_MEDIA_MIME_TYPES=["image/jpeg","image/png","image/webp","video/mp4"] as const;
export async function detectAllowedMedia(bytes:Uint8Array){
 const detected=await fileTypeFromBuffer(bytes);
 if(!detected||!ALLOWED_MEDIA_MIME_TYPES.includes(detected.mime as typeof ALLOWED_MEDIA_MIME_TYPES[number]))return null;
 return detected;
}
