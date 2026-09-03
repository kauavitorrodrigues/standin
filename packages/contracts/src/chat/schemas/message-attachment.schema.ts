import { z } from "zod/v4";
import { FileSchema } from "../../files/schemas/file.schema";
import { MessageErrorMessages } from "./consts/error-messages";

export const MessageAttachmentSchema = z.object({
    id: z.string({ error: MessageErrorMessages.id.invalid }),
    file: FileSchema,
});
