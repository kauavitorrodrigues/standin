import type { ServiceTokenScope } from "@standin/contracts";

export const dedupeScopes = (
    scopes: readonly ServiceTokenScope[]
): ServiceTokenScope[] => [...new Set(scopes)];
