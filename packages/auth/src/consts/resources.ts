import type { Action, Resource } from "../types/permission";

// Add a resource here for every entity that needs role-gated access, then
// give it labels below and permissions in ./roles.
export const RESOURCES = [
    "user",
    "organization",
    "space",
    "map",
    "message",
    "asset",
    "template",
] as const;

export const RESOURCE_LABELS: Record<
    Resource,
    { singular: string; plural: string }
> = {
    user: { singular: "usuário", plural: "usuários" },
    organization: { singular: "organização", plural: "organizações" },
    space: { singular: "espaço", plural: "espaços" },
    map: { singular: "mapa", plural: "mapas" },
    message: { singular: "mensagem", plural: "mensagens" },
    asset: { singular: "recurso", plural: "recursos" },
    template: { singular: "template", plural: "templates" },
};

export const ACTIONS = ["create", "read", "update", "delete"] as const;

export const ACTION_LABELS: Record<Action, string> = {
    create: "criar",
    read: "buscar",
    update: "atualizar",
    delete: "excluir",
};
