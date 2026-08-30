import { z } from "zod/v4";
import { FileErrorMessages } from "./consts/error-messages";

export const FileSchema = z.object({
    id: z.string({ error: FileErrorMessages.id.invalid }),
    originalName: z.string(),
    fileName: z.string(),
    extension: z.string(),
    mimeType: z.string(),
    sizeInBytes: z.number(),
});
