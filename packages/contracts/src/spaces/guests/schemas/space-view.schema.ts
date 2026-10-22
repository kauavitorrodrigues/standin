import { z } from "zod/v4";
import { MapWithUrlsSchema } from "../../../maps/schemas/map-with-urls.schema";
import { SPACE_GUEST_ACCESS, SPACE_VIEWER_KINDS } from "../consts";

// What a person gets when they open a space, the same shape for a member and
// for a guest: nothing of the organization beyond the space itself. The
// conversation is the organization's, so a guest gets none.
export const SpaceViewSchema = z.object({
    id: z.string(),
    name: z.string(),
    conversationId: z.string().nullable(),
    guestAccess: z.enum(SPACE_GUEST_ACCESS),
    viewer: z.object({
        kind: z.enum(SPACE_VIEWER_KINDS),
        isOwner: z.boolean(),
    }),
    map: MapWithUrlsSchema,
});
