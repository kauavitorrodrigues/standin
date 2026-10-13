import type { Role } from "@standin/contracts";
import { PERMISSIONS } from "../consts/roles";
import { ACTION_LABELS, RESOURCE_LABELS } from "../consts/resources";
import type { Action, Resource } from "../types/permission";

export type CanResult = { success: true } | { success: false; error: string };

// A user holds one role per axis, and any of them can grant the action.
export function hasPermission(
    roles: readonly Role[],
    action: Action,
    resource: Resource
): boolean {
    const allowedRoles = PERMISSIONS[resource][action];
    return roles.some((role) => allowedRoles.includes(role));
}

export function can(
    roles: readonly Role[],
    action: Action,
    resource: Resource
): CanResult {
    if (hasPermission(roles, action, resource)) return { success: true };

    return {
        success: false,
        error: `Sem permissão para ${ACTION_LABELS[action]} ${RESOURCE_LABELS[resource].plural}`,
    };
}
