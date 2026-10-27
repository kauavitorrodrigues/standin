import { z } from "zod/v4";

// The conversation the person is typing in. Who is typing comes from the
// socket, never from the payload.
export const ChatTypingSchema = z.object({
    conversationId: z.string().min(1),
    isTyping: z.boolean(),
    // For a connection that is not in a space. In one, the space decides.
    organizationId: z.string().min(1).optional(),
});
