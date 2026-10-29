import type { SERVICE_TOKEN_SCOPES } from "../consts/scopes";

export type ServiceTokenScope = (typeof SERVICE_TOKEN_SCOPES)[number];

// What the API sends about a token. The hash and the clear token never are in
// it, only a short prefix to recognize it in a list.
export type ServiceToken = {
    id: string;
    name: string;
    tokenPrefix: string;
    scopes: ServiceTokenScope[];
    createdById: string;
    lastUsedAt: Date | null;
    expiresAt: Date | null;
    revokedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

// The answer of the creation: the only time the clear token is shown.
export type CreatedServiceToken = {
    token: string;
    serviceToken: ServiceToken;
};
