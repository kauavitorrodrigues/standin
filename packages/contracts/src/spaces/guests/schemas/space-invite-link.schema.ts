import { z } from "zod/v4";
import { SpaceGuestErrorMessages } from "./consts/error-messages";
import {
    DEFAULT_INVITE_LINK_EXPIRES_IN_HOURS,
    MAX_INVITE_LINK_EXPIRES_IN_HOURS,
    MAX_INVITE_LINK_USES,
} from "../consts";

export const SpaceInviteLinkCreateSchema = z.object({
    expiresInHours: z
        .number({ error: SpaceGuestErrorMessages.expiresInHours.invalid })
        .int({ error: SpaceGuestErrorMessages.expiresInHours.invalid })
        .min(1, { error: SpaceGuestErrorMessages.expiresInHours.invalid })
        .max(MAX_INVITE_LINK_EXPIRES_IN_HOURS, {
            error: SpaceGuestErrorMessages.expiresInHours.invalid,
        })
        .default(DEFAULT_INVITE_LINK_EXPIRES_IN_HOURS),
    maxUses: z
        .number({ error: SpaceGuestErrorMessages.maxUses.invalid })
        .int({ error: SpaceGuestErrorMessages.maxUses.invalid })
        .min(1, { error: SpaceGuestErrorMessages.maxUses.invalid })
        .max(MAX_INVITE_LINK_USES, {
            error: SpaceGuestErrorMessages.maxUses.invalid,
        })
        .nullable()
        .default(null),
});

export type SpaceInviteLinkCreateSchemaType = z.infer<
    typeof SpaceInviteLinkCreateSchema
>;

// A link as it is listed. The secret is stored only as a hash, so a listing
// cannot give it back: the token exists once, when the link is created.
export const SpaceInviteLinkSchema = z.object({
    id: z.string(),
    spaceId: z.string(),
    createdBy: z.string().nullable(),
    expiresAt: z.iso.datetime(),
    maxUses: z.number().int().nullable(),
    usesCount: z.number().int(),
    revokedAt: z.iso.datetime().nullable(),
    createdAt: z.iso.datetime(),
});

export const SpaceInviteLinkCreatedSchema = SpaceInviteLinkSchema.extend({
    token: z.string(),
});
