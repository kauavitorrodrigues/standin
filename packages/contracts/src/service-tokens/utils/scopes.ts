import { SERVICE_TOKEN_SCOPES } from "../consts/scopes";
import type {
    ServiceTokenScope,
    ServiceTokenScopeAction,
    ServiceTokenScopeResource,
} from "../types";

type ScopeParts = { resource: string; action: string };

// A scope is "resource:action"; a string without the colon has no parts.
const splitScope = (value: string): ScopeParts | undefined => {
    const colon = value.indexOf(":");
    if (colon === -1) return undefined;
    return { resource: value.slice(0, colon), action: value.slice(colon + 1) };
};

// The scopes the API knows. Anything else, like a scope that was renamed or
// removed after a token was issued, is not one.
export const isServiceTokenScope = (
    value: string
): value is ServiceTokenScope =>
    (SERVICE_TOKEN_SCOPES as readonly string[]).includes(value);

// The scope is "resource:action", so both halves come from the string. A
// string that is not a known scope has neither.
export function getServiceTokenScopeResource(
    scope: ServiceTokenScope
): ServiceTokenScopeResource;
export function getServiceTokenScopeResource(
    scope: string
): ServiceTokenScopeResource | undefined;
export function getServiceTokenScopeResource(
    scope: string
): ServiceTokenScopeResource | undefined {
    if (!isServiceTokenScope(scope)) return undefined;
    return splitScope(scope)?.resource as ServiceTokenScopeResource;
}

export function getServiceTokenScopeAction(
    scope: ServiceTokenScope
): ServiceTokenScopeAction;
export function getServiceTokenScopeAction(
    scope: string
): ServiceTokenScopeAction | undefined;
export function getServiceTokenScopeAction(
    scope: string
): ServiceTokenScopeAction | undefined {
    if (!isServiceTokenScope(scope)) return undefined;
    return splitScope(scope)?.action as ServiceTokenScopeAction;
}

// The resources in the order their first scope appears in the list.
export const SERVICE_TOKEN_SCOPE_RESOURCES: readonly ServiceTokenScopeResource[] =
    [
        ...new Set(
            SERVICE_TOKEN_SCOPES.map((scope) =>
                getServiceTokenScopeResource(scope)
            )
        ),
    ];

// The actions in the order their first scope appears in the list.
export const SERVICE_TOKEN_SCOPE_ACTIONS: readonly ServiceTokenScopeAction[] = [
    ...new Set(
        SERVICE_TOKEN_SCOPES.map((scope) => getServiceTokenScopeAction(scope))
    ),
];

export const getServiceTokenScopesByResource = (
    resource: ServiceTokenScopeResource
): ServiceTokenScope[] =>
    SERVICE_TOKEN_SCOPES.filter(
        (scope) => getServiceTokenScopeResource(scope) === resource
    );
