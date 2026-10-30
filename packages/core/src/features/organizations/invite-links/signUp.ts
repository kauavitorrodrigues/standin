import {
    db,
    organizationInviteLinksTable,
    organizationMembersTable,
    and,
    eq,
    isNull,
    lt,
    or,
    sql,
} from "@standin/database";
import type { Transaction } from "@standin/database";
import {
    InviteLinkExhaustedError,
    ORGANIZATION_MEMBER_ROLES,
} from "@standin/contracts";
import type { User, UserDataSchemaType } from "@standin/contracts";
import { assignRandomAvatar } from "../../avatar/user/assignRandomAvatar";
import { insertUser } from "../../users/utils/insertUser";
import { readUser } from "../../users/utils/readUser";
import { assertLinkUsable } from "../../spaces/guests/invites/utils/assertLinkUsable";
import { lockLinkContext } from "./utils/findLinkContext";

// Spending the use is the check, so two sign ups on the last use cannot both
// pass.
const spendUse = async (tx: Transaction, linkId: string): Promise<void> => {
    const [spent] = await tx
        .update(organizationInviteLinksTable)
        .set({ usesCount: sql`${organizationInviteLinksTable.usesCount} + 1` })
        .where(
            and(
                eq(organizationInviteLinksTable.id, linkId),
                or(
                    isNull(organizationInviteLinksTable.maxUses),
                    lt(
                        organizationInviteLinksTable.usesCount,
                        organizationInviteLinksTable.maxUses
                    )
                )
            )
        )
        .returning({ id: organizationInviteLinksTable.id });

    if (!spent) throw new InviteLinkExhaustedError();
};

/**
 * Creates an account inside the organization of a link, whether or not public
 * sign up is open. The use, the account and the membership are one
 * transaction: a failed sign up (for example an e-mail already taken) spends
 * nothing. The role is always a member, whatever the row says.
 */
export const signUpWithOrganizationInvite = async (
    data: UserDataSchemaType,
    token: string
): Promise<User> => {
    const userId = await db.transaction(async (tx) => {
        const { link, organization } = await lockLinkContext(token, tx);
        assertLinkUsable(link, new Date());
        await spendUse(tx, link.id);

        const id = await insertUser(data, tx);
        await tx.insert(organizationMembersTable).values({
            userId: id,
            organizationId: organization.id,
            role: ORGANIZATION_MEMBER_ROLES.MEMBER,
        });
        return id;
    });

    // It never fails the sign up, and an empty catalog leaves the ghost.
    await assignRandomAvatar(userId);

    return readUser(userId);
};
