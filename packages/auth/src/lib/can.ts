import type { Role } from "@standin/contracts";
import { PERMISSIONS } from "../consts/roles";
import { ACTION_LABELS, RESOURCE_LABELS } from "../consts/resources";
import type { Action, Resource } from "../types/permission";

export type CanResult = { success: true } | { success: false; error: string };

export function hasPermission(
    role: Role,
    action: Action,
    resource: Resource
): boolean {
    return PERMISSIONS[resource][action].includes(role);
}

export function can(role: Role, action: Action, resource: Resource): CanResult {
    if (hasPermission(role, action, resource)) return { success: true };

    return {
        success: false,
        error: `Sem permissão para ${ACTION_LABELS[action]} ${RESOURCE_LABELS[resource].plural}`,
    };
}
