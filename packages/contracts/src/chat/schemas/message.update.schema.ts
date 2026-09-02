import { z } from "zod/v4";
import { MessageDataSchema } from "./message.data.schema";

export const MessageUpdateSchema = MessageDataSchema.pick({ content: true });

export type MessageUpdateSchemaType = z.infer<typeof MessageUpdateSchema>;
