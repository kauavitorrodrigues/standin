import {
    getServiceTokenScopeAction,
    getServiceTokenScopeResource,
    type ServiceTokenScope,
} from "@standin/contracts";
import {
    SERVICE_TOKEN_ACTION_LABELS,
    SERVICE_TOKEN_ACTION_VERBS,
    SERVICE_TOKEN_PENDING_SCOPES,
    SERVICE_TOKEN_RESOURCE_META,
} from "../consts/scopes";
import { SERVICE_TOKEN_SCOPES_TEXT } from "../consts/messages";
import type { ServiceTokenScopeMeta } from "../types";

// "Mapas (leitura)" as the name, "Consultar mapas" as the description, with
// "(em breve)" for a scope that no route accepts yet.
export const getScopeMeta = (
    scope: ServiceTokenScope
): ServiceTokenScopeMeta => {
    const action = getServiceTokenScopeAction(scope);
    const resource =
        SERVICE_TOKEN_RESOURCE_META[getServiceTokenScopeResource(scope)];
    const description = `${SERVICE_TOKEN_ACTION_VERBS[action]} ${resource.label.toLowerCase()}`;
    const pending = SERVICE_TOKEN_PENDING_SCOPES.includes(scope);

    return {
        label: `${resource.label} (${SERVICE_TOKEN_ACTION_LABELS[action].toLowerCase()})`,
        description: pending
            ? `${description} ${SERVICE_TOKEN_SCOPES_TEXT.PENDING_HINT}`
            : description,
        icon: resource.icon,
    };
};
