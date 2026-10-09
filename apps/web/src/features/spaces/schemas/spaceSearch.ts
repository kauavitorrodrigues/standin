import { z } from "zod";
import { CHAT_PAGE_MODES } from "@/features/chat/consts/chatPage";
import { SPACE_VIEWS } from "@/features/spaces/consts/view";

// Anything unrecognised is dropped instead of failing the route, since the URL
// can be hand-typed or come from an old link. Every field is optional so a
// plain link to the space needs no search; the defaults are applied by
// useSpaceSearch.
export const spaceSearchSchema = z.object({
    view: z.enum(Object.values(SPACE_VIEWS)).optional().catch(undefined),
    // Only meaningful on the chat view. Missing means the space conversation.
    conversation: z.string().optional().catch(undefined),
    chatMode: z
        .enum(Object.values(CHAT_PAGE_MODES))
        .optional()
        .catch(undefined),
});

export type SpaceSearch = z.infer<typeof spaceSearchSchema>;
