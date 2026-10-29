import type { ServiceTokenScope } from "@standin/contracts";

export const hasScope = (
    scopes: readonly ServiceTokenScope[],
    scope: ServiceTokenScope
): boolean => scopes.includes(scope);
