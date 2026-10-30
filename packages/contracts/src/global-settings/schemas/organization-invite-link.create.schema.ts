import { z } from "zod/v4";
import {
    DEFAULT_INVITE_LINK_EXPIRES_IN_HOURS,
    MAX_INVITE_LINK_EXPIRES_IN_HOURS,
    MAX_INVITE_LINK_USES,
} from "../../spaces/guests/consts";
import { ORGANIZATION_INVITE_LINK_ROLES } from "../consts";

export const OrganizationInviteLinkCreateSchema = z.object({
    expiresInHours: z
        .number()
        .int()
        .min(1)
        .max(MAX_INVITE_LINK_EXPIRES_IN_HOURS)
        .default(DEFAULT_INVITE_LINK_EXPIRES_IN_HOURS),
    maxUses: z
        .number()
        .int()
        .min(1)
        .max(MAX_INVITE_LINK_USES)
        .nullable()
        .default(null),
    role: z.enum(ORGANIZATION_INVITE_LINK_ROLES).default("MEMBER"),
});

export type OrganizationInviteLinkCreateInput = z.infer<
    typeof OrganizationInviteLinkCreateSchema
>;
