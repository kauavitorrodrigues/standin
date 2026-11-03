import {
    db,
    organizationMembersTable,
    usersTable,
    and,
    eq,
    isNull,
} from "@standin/database";
import {
    ORGANIZATION_MEMBER_ROLES,
    OrganizationInvitationEmailMismatchError,
} from "@standin/contracts";
import type {
    OrganizationInvitationAccepted,
    OrganizationInvitationPreview,
    User,
    UserDataSchemaType,
} from "@standin/contracts";
import { assignRandomAvatar } from "../../avatar/user/assignRandomAvatar";
import { DeskService } from "../../maps/desks";
import { insertUser } from "../../users/utils/insertUser";
import { readUser } from "../../users/utils/readUser";
import { publishOrganizationMembersChanged } from "../members/membersChangedEvents";
import { claimInvitation } from "./claim";
import { findInvitationContext } from "./find";
import type { InvitationContext } from "./types";
import { hasKeptDesk, isDeskUnavailableError, isInvitedEmail } from "./utils";

// The desk is a bonus: when it cannot be given (someone took it, or it or its
// space is gone) the person joined all the same, so this never fails.
const assignKeptDesk = async (
    invitation: InvitationContext,
    userId: string
): Promise<void> => {
    if (!hasKeptDesk(invitation)) return;

    try {
        await DeskService.assign(
            invitation.spaceId,
            invitation.mapAssetId,
            userId,
            invitation.createdBy ?? userId
        );
    } catch (error) {
        if (isDeskUnavailableError(error)) return;
        throw error;
    }
};

/** What the page of an invitation shows. */
export const previewOrganizationInvitation = async (
    token: string
): Promise<OrganizationInvitationPreview> => {
    const invitation = await findInvitationContext(token);
    return {
        organizationName: invitation.organizationName,
        inviterName: invitation.inviterName,
        email: invitation.email,
    };
};

/**
 * A person who already has an account takes the invitation. Only the account of
 * the e-mail it was made for can.
 */
export const acceptOrganizationInvitation = async (
    userId: string,
    token: string
): Promise<OrganizationInvitationAccepted> => {
    const invitation = await findInvitationContext(token);

    const [user] = await db
        .select({ email: usersTable.email })
        .from(usersTable)
        .where(and(eq(usersTable.id, userId), isNull(usersTable.deletedAt)));
    if (!isInvitedEmail(user, invitation)) {
        throw new OrganizationInvitationEmailMismatchError();
    }

    await db.transaction(async (tx) => {
        await claimInvitation(tx, invitation.id);
        // Already a member through another way: nothing to add.
        await tx
            .insert(organizationMembersTable)
            .values({
                userId,
                organizationId: invitation.organizationId,
                role: ORGANIZATION_MEMBER_ROLES.MEMBER,
            })
            .onConflictDoNothing();
    });

    await assignKeptDesk(invitation, userId);
    await publishOrganizationMembersChanged({
        organizationId: invitation.organizationId,
    });
    return { organizationId: invitation.organizationId };
};

/**
 * A person creates an account from an invitation. The e-mail is the one it was
 * made for, so the account is the invited one.
 */
export const signUpWithOrganizationInvitation = async (
    data: UserDataSchemaType,
    token: string
): Promise<User> => {
    const invitation = await findInvitationContext(token);
    if (!isInvitedEmail(data, invitation)) {
        throw new OrganizationInvitationEmailMismatchError();
    }

    const userId = await db.transaction(async (tx) => {
        await claimInvitation(tx, invitation.id);
        const id = await insertUser(data, tx);
        await tx.insert(organizationMembersTable).values({
            userId: id,
            organizationId: invitation.organizationId,
            role: ORGANIZATION_MEMBER_ROLES.MEMBER,
        });
        return id;
    });

    await assignRandomAvatar(userId);
    await assignKeptDesk(invitation, userId);
    await publishOrganizationMembersChanged({
        organizationId: invitation.organizationId,
    });
    return readUser(userId);
};
