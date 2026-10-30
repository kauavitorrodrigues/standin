import {
    SERVICE_TOKEN_SCOPE_ACTIONS,
    SERVICE_TOKEN_SCOPE_RESOURCES,
    getServiceTokenScopesByResource,
} from "@standin/contracts";
import {
    SERVICE_TOKEN_ACTION_LABELS,
    SERVICE_TOKEN_RESOURCE_META,
} from "../consts/scopes";
import type { ServiceTokenScopeColumn, ServiceTokenScopeGroup } from "../types";

// One row per resource, drawn from the scope data.
export const getScopeGroups = (): ServiceTokenScopeGroup[] =>
    SERVICE_TOKEN_SCOPE_RESOURCES.map((resource) => ({
        resource,
        ...SERVICE_TOKEN_RESOURCE_META[resource],
        scopes: getServiceTokenScopesByResource(resource),
    }));

// One column per action, drawn from the scope data.
export const getScopeColumns = (): ServiceTokenScopeColumn[] =>
    SERVICE_TOKEN_SCOPE_ACTIONS.map((action) => ({
        action,
        label: SERVICE_TOKEN_ACTION_LABELS[action],
    }));
