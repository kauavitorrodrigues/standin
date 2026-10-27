import { z } from "zod/v4";

// Query of GET /organizations/:organizationId/conversations.
export const ConversationsListQuerySchema = z.object({
    search: z.string().trim().optional(),
});

export type ConversationsListQuery = z.infer<
    typeof ConversationsListQuerySchema
>;
