import { closeInvitationsOfEmail } from "./closeInvitationsOfEmail";
import { closeOrganizationMembership } from "./closeMembership";
import { findUserEmail } from "./findEmail";
import { findActiveMemberRole } from "./findActiveRole";
import { findActiveMemberIdsAmong } from "./findActiveAmong";
import { findOrganizationOwnerIds } from "./findOwnerIds";

export const OrganizationMemberRepository = {
    findOwnerIds: findOrganizationOwnerIds,
    findActiveAmong: findActiveMemberIdsAmong,
    closeMembership: closeOrganizationMembership,
    findActiveRole: findActiveMemberRole,
    closeInvitationsOfEmail,
    findUserEmail,
};
