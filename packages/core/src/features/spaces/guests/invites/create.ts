import { db, spaceInviteLinksTable } from "@standin/database";
import type {
    SpaceInviteLinkCreated,
    SpaceInviteLinkCreateSchemaType,
} from "@standin/contracts";
import { linkSelect } from "./consts/select";
import { generateInviteToken, hashInviteToken } from "./utils/generateToken";
import { serializeLink } from "./utils/serializeLink";

const HOUR_MS = 60 * 60 * 1000;

/**
 * Makes a link. The token comes back only here: the database keeps its hash,
 * so it cannot be read again later.
 */
export const createInviteLink = async (
    spaceId: string,
    createdBy: string,
    data: SpaceInviteLinkCreateSchemaType
): Promise<SpaceInviteLinkCreated> => {
    const token = generateInviteToken();

    const [link] = await db
        .insert(spaceInviteLinksTable)
        .values({
            spaceId,
            createdBy,
            tokenHash: hashInviteToken(token),
            expiresAt: new Date(Date.now() + data.expiresInHours * HOUR_MS),
            maxUses: data.maxUses,
        })
        .returning(linkSelect);

    return { ...serializeLink(link), token };
};
