import { findActiveOrganizationMembers } from "./findActive";
import { listActiveOrganizationMembersWithProfile } from "./listActiveWithProfile";
import {
    onOrganizationMemberRemoved,
    publishOrganizationMemberRemoved,
} from "./memberRemovedEvents";

export const OrganizationMemberService = {
    findActive: findActiveOrganizationMembers,
    listActiveWithProfile: listActiveOrganizationMembersWithProfile,
    // Hook for the socket: runs after a membership ends.
    onRemoved: onOrganizationMemberRemoved,
    // For whatever ends a membership, once it is saved.
    publishRemoved: publishOrganizationMemberRemoved,
};

export type {
    OrganizationMemberRemoval,
    OrganizationMemberRemovedListener,
} from "./memberRemovedEvents";
