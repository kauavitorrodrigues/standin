import { z } from "zod/v4";

// A person mentioned in a message, with the name they have now. The content
// only holds the link, so a renamed person shows with the new name in old
// messages.
export const MessageMentionSchema = z.object({
    userId: z.string(),
    name: z.string(),
});
