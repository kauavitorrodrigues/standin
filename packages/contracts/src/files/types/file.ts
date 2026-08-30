import type { z } from "zod/v4";
import type { FileSchema } from "../schemas/file.schema";

export type File = z.infer<typeof FileSchema>;

export type UploadFileInput = {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
};