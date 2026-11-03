import { findActiveOrganizationMembers } from "./findActive";
import { listOrganizationMemberEntries } from "./listEntries";
import { listActiveOrganizationMembersWithProfile } from "./listActiveWithProfile";
import { OrganizationMemberRepository } from "./repository";
import {
    onOrganizationMembersChanged,
    publishOrganizationMembersChanged,
} from "./membersChangedEvents";
import {
    onOrganizationMemberRemoved,
    publishOrganizationMemberRemoved,
} from "./memberRemovedEvents";

export const OrganizationMemberService = {
    findActive: findActiveOrganizationMembers,
    listEntries: listOrganizationMemberEntries,
    listActiveWithProfile: listActiveOrganizationMembersWithProfile,
    // Hook for the socket: runs after a membership ends.
    onRemoved: onOrganizationMemberRemoved,
    // For whatever ends a membership, once it is saved.
    publishRemoved: publishOrganizationMemberRemoved,
    findOwnerIds: OrganizationMemberRepository.findOwnerIds,
    // Hook for the socket: runs after someone joins or an invitation changes.
    onChanged: onOrganizationMembersChanged,
    // For whatever adds a person or changes an invitation, once it is saved.
    publishChanged: publishOrganizationMembersChanged,
};

export type {
    OrganizationMembersChange,
    OrganizationMembersChangedListener,
} from "./membersChangedEvents";
export type {
    OrganizationMemberRemoval,
    OrganizationMemberRemovedListener,
} from "./memberRemovedEvents";
