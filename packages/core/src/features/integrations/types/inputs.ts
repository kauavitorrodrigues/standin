import type { AppConnectionKey, OrganizationIntegrationKey } from "./keys";

export type UpsertOrganizationIntegrationInput = OrganizationIntegrationKey & {
    updatedById: string;
    clientId: string;
    clientSecretSealed: string;
};

export type UpsertAppConnectionInput = AppConnectionKey & {
    accountId: string;
    accountImageUrl: string | null;
    refreshTokenSealed: string;
    scope: string;
};
