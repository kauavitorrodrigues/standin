import { z } from "zod/v4";
import { SpaceGuestStateSchema } from "./space-guest.schema";

export const InvitePreviewSchema = z.object({
    spaceId: z.string(),
    spaceName: z.string(),
    inviterName: z.string().nullable(),
    // A member of the space's organization needs no invite.
    isMember: z.boolean(),
    guest: SpaceGuestStateSchema.nullable(),
});

export const InviteRequestResultSchema = z.object({
    spaceId: z.string(),
    isMember: z.boolean(),
    guest: SpaceGuestStateSchema.nullable(),
});
