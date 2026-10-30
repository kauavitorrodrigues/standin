import { LayoutTemplateIcon, LibraryIcon, MapIcon } from "lucide-react";
import type {
    ServiceTokenScope,
    ServiceTokenScopeAction,
    ServiceTokenScopeResource,
} from "@standin/contracts";
import type { ServiceTokenResourceMeta } from "../types";

// What each resource is called and holds. A new resource in the contracts
// needs one entry here, and the matrix picks it up as a row.
export const SERVICE_TOKEN_RESOURCE_META: Record<
    ServiceTokenScopeResource,
    ServiceTokenResourceMeta
> = {
    library: {
        label: "Biblioteca",
        description: "Recursos, tilesets, áreas e peças de avatar",
        icon: LibraryIcon,
    },
    maps: {
        label: "Mapas",
        description: "Os mapas dos espaços, para ler e aplicar alterações",
        icon: MapIcon,
    },
    templates: {
        label: "Modelos de mapa",
        description: "Os modelos de mapa do catálogo",
        icon: LayoutTemplateIcon,
    },
};

// The name of each action as a column, and as a verb in a description.
export const SERVICE_TOKEN_ACTION_LABELS: Record<
    ServiceTokenScopeAction,
    string
> = {
    read: "Leitura",
    write: "Escrita",
};

export const SERVICE_TOKEN_ACTION_VERBS: Record<
    ServiceTokenScopeAction,
    string
> = {
    read: "Consultar",
    write: "Alterar",
};

// The scopes no route accepts yet. They can be given to a token, but they
// do nothing until the route exists.
export const SERVICE_TOKEN_PENDING_SCOPES: readonly ServiceTokenScope[] = [
    "library:write",
    "templates:read",
    "templates:write",
];
