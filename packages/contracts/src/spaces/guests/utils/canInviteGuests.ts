import { ORGANIZATION_MEMBER_ROLES } from "../../../organizations/enums/organization-member-role";
import type { OrganizationMemberRole } from "../../../organizations/types/organization-membership";

/**
 * Who may get the guest invite link of a space. The owner always can; a member
 * only when the space lets members invite.
 */
export const canInviteGuests = (
    role: OrganizationMemberRole,
    membersCanInvite: boolean
): boolean => {
    switch (role) {
        case ORGANIZATION_MEMBER_ROLES.OWNER:
            return true;
        case ORGANIZATION_MEMBER_ROLES.MEMBER:
            return membersCanInvite;
    }
};
