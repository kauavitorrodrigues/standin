import { findActiveOrganizationMembers } from "./findActive";
import { listActiveOrganizationMembersWithProfile } from "./listActiveWithProfile";

export const OrganizationMemberService = {
    findActive: findActiveOrganizationMembers,
    listActiveWithProfile: listActiveOrganizationMembersWithProfile,
};
