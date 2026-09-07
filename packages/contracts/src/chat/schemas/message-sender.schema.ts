import { z } from "zod/v4";
import { MessageErrorMessages } from "./consts/error-messages";

export const MessageSenderSchema = z.object({
    id: z.string({ error: MessageErrorMessages.senderId.invalid }),
    name: z.string(),
    avatarUrl: z.string().nullable(),
});