import { LayoutTemplateIcon, LibraryIcon, MapIcon } from "lucide-react";
import type { ServiceTokenScope } from "@standin/contracts";
import type { ServiceTokenScopeMeta } from "../types";

// What each scope is called and what it lets a service do. A new scope in
// the contracts needs one entry here, and the form and the list pick it up.
export const SERVICE_TOKEN_SCOPE_META: Record<
    ServiceTokenScope,
    ServiceTokenScopeMeta
> = {
    "library:write": {
        label: "Biblioteca",
        description:
            "Cadastra e atualiza recursos, tilesets, áreas e peças de avatar.",
        icon: LibraryIcon,
    },
    "maps:write": {
        label: "Mapas",
        description: "Aplica alterações nos mapas já publicados.",
        icon: MapIcon,
    },
    "templates:write": {
        label: "Modelos de mapa",
        description: "Cria e atualiza os modelos de mapa.",
        icon: LayoutTemplateIcon,
    },
};
