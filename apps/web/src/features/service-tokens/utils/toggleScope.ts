import type { ServiceTokenScope } from "@standin/contracts";

export const toggleScope = (
    selected: readonly ServiceTokenScope[],
    scope: ServiceTokenScope
): ServiceTokenScope[] => {
    if (selected.includes(scope)) return selected.filter((s) => s !== scope);
    return [...selected, scope];
};
