import type { z } from "zod/v4";
import type { DirectConversationResponseSchema } from "../schemas/direct-conversation.response.schema";

export type DirectConversationResponse = z.infer<
    typeof DirectConversationResponseSchema
>;
