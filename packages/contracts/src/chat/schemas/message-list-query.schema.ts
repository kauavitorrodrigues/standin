import { z } from "zod/v4";
import { MessageListQueryErrorMessages } from "./consts/error-messages";
import {
    DEFAULT_MESSAGE_LIST_LIMIT,
    MAX_MESSAGE_LIST_LIMIT,
} from "./consts/fields";

export const MessageListQuerySchema = z.object({
    cursor: z
        .string({ error: MessageListQueryErrorMessages.cursor.invalid })
        .optional(),
    limit: z.coerce
        .number({ error: MessageListQueryErrorMessages.limit.invalid })
        .int({ error: MessageListQueryErrorMessages.limit.invalid })
        .min(1, { error: MessageListQueryErrorMessages.limit.min })
        .max(MAX_MESSAGE_LIST_LIMIT, {
            error: MessageListQueryErrorMessages.limit.max,
        })
        .optional()
        .default(DEFAULT_MESSAGE_LIST_LIMIT),
    // When set, lists the replies of that top-level message instead of the
    // main conversation list.
    threadParentId: z
        .string({ error: MessageListQueryErrorMessages.threadParentId.invalid })
        .min(1, { error: MessageListQueryErrorMessages.threadParentId.invalid })
        .optional(),
});

export type MessageListQuerySchemaType = z.infer<typeof MessageListQuerySchema>;
