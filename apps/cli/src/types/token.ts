import type {
    ServiceToken,
    ServiceTokenCreateSchema,
    ServiceTokenScope,
} from "@standin/contracts";

export type TokenCreateArgs = {
    name: string;
    scope: string[];
    expiresAt?: string;
    admin?: string;
};

export type TokenRevokeArgs = {
    id: string;
};

// Every token command takes the global flags only, `list` nothing else.
export type TokenListArgs = Record<never, never>;

export type TokenAdmin = {
    id: string;
    email: string;
};

export type TokenStatus = "active" | "revoked" | "expired";

export type TokenRow = {
    id: string;
    name: string;
    prefix: string;
    scopes: ServiceTokenScope[];
    status: TokenStatus;
    expiresAt: Date | null;
    lastUsedAt: Date | null;
    createdAt: Date;
};

export type TokenListResult = {
    tokens: TokenRow[];
};

export type TokenCreateResult = {
    // The only time the clear token is shown.
    token: string;
    serviceToken: TokenRow;
    owner: string;
};

export type TokenCreateDryRunResult = {
    dryRun: true;
    databaseChecked: false;
    input: {
        name: string;
        scopes: ServiceTokenScope[];
        expiresAt: string | null;
        admin: string | null;
    };
};

export type TokenRevokeResult = {
    dryRun: boolean;
    id: string;
    revokedAt?: Date | null;
};

export type TokenSource = Pick<ServiceToken, "revokedAt" | "expiresAt">;

// What parsing the input of a token gives: the input, or the issues.
export type TokenInputParse = ReturnType<
    typeof ServiceTokenCreateSchema.safeParse
>;
