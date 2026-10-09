import { ROLES, type Role } from "@standin/contracts";
import type { Action, Resource } from "../types/permission";

export const ALL_ROLES = [ROLES.ADMIN, ROLES.OWNER, ROLES.MEMBER] as const;

export const MANAGER_ROLES = [ROLES.ADMIN, ROLES.OWNER] as const;

type ActionPermissions = Record<Action, readonly Role[]>;

/**
 * Organization-managed resource: every role reads, only admins and owners
 * write. Pass overrides to loosen or tighten a single action without
 * repeating the whole matrix.
 */
function createManagerPermissions(
    overrides: Partial<ActionPermissions> = {}
): ActionPermissions {
    return {
        create: MANAGER_ROLES,
        read: ALL_ROLES,
        update: MANAGER_ROLES,
        delete: MANAGER_ROLES,
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

export const PERMISSIONS: Record<Resource, ActionPermissions> = {
    // Everyone updates their own profile. "Is this the same user?" is not a
    // role check, so it stays in the controller/service.
    user: createOpenPermissions(),
    // Any authenticated user can create an organization (and becomes its
    // owner). Only owners and admins edit or delete it.
    organization: createManagerPermissions({ create: ALL_ROLES }),
    space: createManagerPermissions(),
    map: createManagerPermissions(),
    // Chat is shared work between members. Access to a conversation is
    // enforced by its own middleware, not by this matrix.
    message: createOpenPermissions(),
};
