import {
    db,
    inArray,
    organizationMembersTable,
    spacesTable,
    eq,
    usersTable,
} from "@standin/database";
import { ORGANIZATION_MEMBER_ROLES } from "@standin/contracts";
import { createJWT } from "../../../lib/jwt";
import { BOT_EMAIL_DOMAIN } from "../consts";

export type BotAccount = { userId: string; token: string };

const buildEmail = (index: number) =>
    `bot-${index}@${BOT_EMAIL_DOMAIN}`;

// Makes sure `count` bot users exist and are members of the organization of
// the space, then signs a token for each the way the login does. Idempotent,
// so a second run reuses the same bots. Members join with no further check.
export const provisionBots = async (
    spaceId: string,
    count: number
): Promise<BotAccount[]> => {
    const [space] = await db
        .select({ organizationId: spacesTable.organizationId })
        .from(spacesTable)
        .where(eq(spacesTable.id, spaceId))
        .limit(1);
    if (!space) throw new Error(`Space ${spaceId} not found.`);

    const emails = Array.from({ length: count }, (_, i) => buildEmail(i));
    await db
        .insert(usersTable)
        .values(
            emails.map((email, i) => ({ name: `Load bot ${i}`, email }))
        )
        .onConflictDoNothing();

    const users = await db
        .select({ id: usersTable.id, email: usersTable.email })
        .from(usersTable)
        .where(inArray(usersTable.email, emails));

    await db
        .insert(organizationMembersTable)
        .values(
            users.map((user) => ({
                userId: user.id,
                organizationId: space.organizationId,
                role: ORGANIZATION_MEMBER_ROLES.MEMBER,
            }))
        )
        .onConflictDoNothing();

    return emails.map((email) => {
        const user = users.find((candidate) => candidate.email === email)!;
        return { userId: user.id, token: createJWT({ id: user.id }) };
    });
};
