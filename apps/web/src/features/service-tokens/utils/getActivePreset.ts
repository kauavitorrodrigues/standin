import type { ServiceTokenScope } from "@standin/contracts";
import { SERVICE_TOKEN_SCOPE_PRESETS } from "../consts/scopePresets";
import type { ServiceTokenScopePreset } from "../types";

// The preset whose scopes are exactly the selection, in any order, or null.
export const getActivePreset = (
    selected: readonly ServiceTokenScope[]
): ServiceTokenScopePreset | null => {
    const match = SERVICE_TOKEN_SCOPE_PRESETS.find(
        (preset) =>
            preset.scopes.length === selected.length &&
            preset.scopes.every((scope) => selected.includes(scope))
    );
    return match ?? null;
};
