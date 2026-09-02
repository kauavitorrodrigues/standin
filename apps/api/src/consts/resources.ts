export const RESOURCES = [
    "user",
    "organization",
    "space",
    "map",
    "message",
] as const;

export type Resource = (typeof RESOURCES)[number];

export const RESOURCE_LABELS: Record<
    Resource,
    { singular: string; plural: string }
> = {
    user: {
        singular: "usuário",
        plural: "usuários",
    },
    organization: {
        singular: "organização",
        plural: "organizações",
    },
    space: {
        singular: "espaço",
        plural: "espaços",
    },
    map: {
        singular: "mapa",
        plural: "mapas",
    },
    message: {
        singular: "mensagem",
        plural: "mensagens",
    },
};

export const ACTIONS = ["create", "read", "update", "delete"] as const;

export type Action = (typeof ACTIONS)[number];

export const ACTION_LABELS: Record<Action, string> = {
    create: "criar",
    read: "buscar",
    update: "atualizar",
    delete: "excluir",
};
