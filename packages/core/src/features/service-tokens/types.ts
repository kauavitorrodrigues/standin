import type { ServiceTokenScope } from "@standin/contracts";

export type CreateServiceTokenInput = {
    name: string;
    scopes: ServiceTokenScope[];
    expiresAt?: Date;
};

export type InsertServiceTokenInput = CreateServiceTokenInput & {
    createdById: string;
    tokenHash: string;
    tokenPrefix: string;
};
