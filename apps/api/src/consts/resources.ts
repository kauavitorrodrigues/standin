export const RESOURCES = ["user", "organization", "space"] as const;

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
};

export const ACTIONS = ["create", "read", "update", "delete"] as const;

export type Action = (typeof ACTIONS)[number];

export const ACTION_LABELS: Record<Action, string> = {
    create: "criar",
    read: "buscar",
    update: "atualizar",
    delete: "excluir",
};
