import { ROLES, type Role } from "@standin/contracts";
import type { Action, Resource } from "../types/permission";

export const ALL_ROLES = [ROLES.ADMIN, ROLES.OWNER, ROLES.MEMBER] as const;

type ActionPermissions = Record<Action, readonly Role[]>;

/**
 * Every role reads, only the given roles write. Pass overrides to loosen or
 * tighten a single action without repeating the whole matrix.
 */
function createWritePermissions(
    writers: readonly Role[],
    overrides: Partial<ActionPermissions> = {}
): ActionPermissions {
    return {
        create: writers,
        read: ALL_ROLES,
        update: writers,
        delete: writers,
        ...overrides,
    };
}

/** Shared work: every role can do everything. Ownership is checked in the service. */
function createOpenPermissions(): ActionPermissions {
    return {
        create: ALL_ROLES,
        read: ALL_ROLES,
        update: ALL_ROLES,
        delete: ALL_ROLES,
    };
}

// The admin has no implicit access to organizations: organization resources
// are written by the owner only. An admin who also owns an organization
// holds both roles (see `resolveRoles`).
export const PERMISSIONS: Record<Resource, ActionPermissions> = {
    // Everyone updates their own profile. "Is this the same user?" is not a
    // role check, so it stays in the controller/service.
    user: createOpenPermissions(),
    // Any authenticated user can create an organization (and becomes its
    // owner). Only the owner edits or deletes it, and manages its members.
    organization: createWritePermissions([ROLES.OWNER], { create: ALL_ROLES }),
    // Spaces and the maps inside them are built by the owner.
    space: createWritePermissions([ROLES.OWNER]),
    map: createWritePermissions([ROLES.OWNER]),
    // Chat is shared work between members. Access to a conversation is
    // enforced by its own middleware, not by this matrix.
    message: createOpenPermissions(),
    // The global asset library is managed by the admin and the library of an
    // organization by its owner (the route decides which scope the user is
    // in). Everyone reads them to build spaces.
    asset: createWritePermissions([ROLES.ADMIN, ROLES.OWNER]),
    // The template catalog is the admin's.
    template: createWritePermissions([ROLES.ADMIN]),
};
