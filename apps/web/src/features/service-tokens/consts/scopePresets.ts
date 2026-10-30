import { BoxesIcon, MapIcon, ShieldCheckIcon } from "lucide-react";
import { SERVICE_TOKEN_SCOPES } from "@standin/contracts";
import type { ServiceTokenScopePreset } from "../types";

// Shortcuts above the permissions table. "Acesso total" follows the contracts,
// so a new scope is included without touching it.
export const SERVICE_TOKEN_SCOPE_PRESETS: readonly ServiceTokenScopePreset[] = [
    {
        id: "content",
        label: "Conteúdo",
        icon: BoxesIcon,
        scopes: ["library:write", "templates:write"],
    },
    {
        id: "maps",
        label: "Mapas",
        icon: MapIcon,
        scopes: ["maps:write"],
    },
    {
        id: "all",
        label: "Acesso total",
        icon: ShieldCheckIcon,
        scopes: SERVICE_TOKEN_SCOPES,
    },
];
