import {
    SERVICE_TOKEN_SCOPES,
    getServiceTokenScopeAction,
    type ServiceTokenScope,
    type ServiceTokenScopeAction,
} from "@standin/contracts";
import type { ServiceTokenScopeCheckedState } from "../types";

// The scopes of one action across every resource (a column).
export const getScopesOfAction = (
    action: ServiceTokenScopeAction
): ServiceTokenScope[] =>
    SERVICE_TOKEN_SCOPES.filter(
        (scope) => getServiceTokenScopeAction(scope) === action
    );

// The state of a checkbox that stands for a set of scopes: all of them
// selected, some of them (indeterminate) or none.
export const getScopeCheckedState = (
    selected: readonly ServiceTokenScope[],
    scopes: readonly ServiceTokenScope[]
): ServiceTokenScopeCheckedState => {
    const count = scopes.filter((scope) => selected.includes(scope)).length;
    return {
        checked: scopes.length > 0 && count === scopes.length,
        indeterminate: count > 0 && count < scopes.length,
    };
};

// The selection with these scopes added or removed, the rest untouched, in
// the order of the list and without repeats.
export const setScopes = (
    selected: readonly ServiceTokenScope[],
    scopes: readonly ServiceTokenScope[],
    checked: boolean
): ServiceTokenScope[] => {
    const next = selected.filter((scope) => !scopes.includes(scope));
    if (checked) next.push(...scopes);
    // Always in the order of the list, whatever order they were clicked in.
    return SERVICE_TOKEN_SCOPES.filter((scope) => next.includes(scope));
};
