import { db, organizationInviteLinksTable } from "@standin/database";
import type {
    OrganizationInviteLinkCreated,
    OrganizationInviteLinkCreateInput,
} from "@standin/contracts";
import {
    generateInviteToken,
    hashInviteToken,
} from "../../spaces/guests/invites/utils/generateToken";
import { linkSelect } from "./consts";
import { serializeLink } from "./utils/serializeLink";

const HOUR_MS = 60 * 60 * 1000;

/**
 * Makes a link. The token comes back only here: the database keeps its hash,
 * so it cannot be read again later.
 */
export const createOrganizationInviteLink = async (
    organizationId: string,
    createdBy: string,
    data: OrganizationInviteLinkCreateInput
): Promise<OrganizationInviteLinkCreated> => {
    const token = generateInviteToken();

    const [link] = await db
        .insert(organizationInviteLinksTable)
        .values({
            organizationId,
            createdBy,
            tokenHash: hashInviteToken(token),
            role: data.role,
            expiresAt: new Date(Date.now() + data.expiresInHours * HOUR_MS),
            maxUses: data.maxUses,
        })
        .returning(linkSelect);

    return { ...serializeLink(link), token };
};
