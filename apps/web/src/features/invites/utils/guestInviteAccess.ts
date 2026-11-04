import { canInviteGuests, ORGANIZATION_MEMBER_ROLES } from "@standin/contracts";

// The two kinds of person that reach the invite dialog, as the roles the rule
// of the contracts reads. The server answers 403 to anyone the rule keeps out.
const ROLE_OF_OWNER = {
    true: ORGANIZATION_MEMBER_ROLES.OWNER,
    false: ORGANIZATION_MEMBER_ROLES.MEMBER,
} as const;

/** Whether the person is offered the guest invite link of the space. */
export const canGetGuestLink = (
    isOwner: boolean,
    membersCanInvite: boolean | undefined
): boolean =>
    canInviteGuests(ROLE_OF_OWNER[`${isOwner}`], membersCanInvite ?? false);
