import type { z } from "zod/v4";
import type { ConversationsListResponseSchema } from "../schemas/conversations-list.response.schema";

export type ConversationsListResponse = z.infer<
    typeof ConversationsListResponseSchema
>;
