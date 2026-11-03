import { z } from "zod/v4";
import { PageQuerySchema } from "../../../__shared__";
import {
    SPACE_GUEST_LIST_STATES,
    SPACE_GUEST_STATUS_REASONS,
    SPACE_GUEST_STATUSES,
} from "../consts";

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
    // Null: no end, a host sends the guest out.
    expiresAt: z.iso.datetime().nullable(),
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
    expiresAt: z.iso.datetime().nullable(),
});

// What the hosts see: grouped by what they can do with each one, the closed
// ones capped to the most recent.
export const SpaceGuestListSchema = z.object({
    pending: z.array(SpaceGuestSchema),
    admitted: z.array(SpaceGuestSchema),
    closed: z.array(SpaceGuestSchema),
});

// A row of the full list of guests of the space.
export const SpaceGuestEntrySchema = SpaceGuestSchema.extend({
    state: z.enum(SPACE_GUEST_LIST_STATES),
    archivedAt: z.iso.datetime().nullable(),
});

// One page of the full list and how many guests match in all.
export const SpaceGuestEntryListSchema = z.object({
    guests: z.array(SpaceGuestEntrySchema),
    total: z.number().int().min(0),
});

// The page, the search by name and the state chip of the full list.
export const SpaceGuestEntriesQuerySchema = PageQuerySchema.extend({
    state: z.enum(SPACE_GUEST_LIST_STATES).optional(),
});
