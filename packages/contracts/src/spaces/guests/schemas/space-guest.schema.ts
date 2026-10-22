import { z } from "zod/v4";
import { SPACE_GUEST_STATUS_REASONS, SPACE_GUEST_STATUSES } from "../consts";

export const SpaceGuestSchema = z.object({
    id: z.string(),
    spaceId: z.string(),
    userId: z.string(),
    name: z.string(),
    // The photo of the person, null when they have none.
    profilePictureUrl: z.string().nullable(),
    status: z.enum(SPACE_GUEST_STATUSES),
    statusReason: z.enum(SPACE_GUEST_STATUS_REASONS),
    respondedBy: z.string().nullable(),
    respondedAt: z.iso.datetime().nullable(),
    expiresAt: z.iso.datetime(),
    requestedAt: z.iso.datetime(),
});

// What the guest sees of their own request.
export const SpaceGuestStateSchema = SpaceGuestSchema.pick({
    id: true,
    spaceId: true,
    status: true,
    statusReason: true,
    respondedAt: true,
    expiresAt: true,
});

// A space the person entered as a guest and can still enter.
export const GuestSpaceSchema = z.object({
    id: z.string(),
    name: z.string(),
    expiresAt: z.iso.datetime(),
});

// What the hosts see: grouped by what they can do with each one, the closed
// ones capped to the most recent.
export const SpaceGuestListSchema = z.object({
    pending: z.array(SpaceGuestSchema),
    admitted: z.array(SpaceGuestSchema),
    closed: z.array(SpaceGuestSchema),
});
