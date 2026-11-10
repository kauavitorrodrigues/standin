import type {
    IntegrationProvider,
    IntegrationServiceKind,
} from "@standin/contracts";

// The app an organization brought for a provider.
export type OrganizationIntegrationKey = {
    organizationId: string;
    provider: IntegrationProvider;
};

// What a connection is made for: the provider and the service it serves.
export type ConnectionTarget = OrganizationIntegrationKey & {
    service: IntegrationServiceKind;
};

export type AppConnectionKey = ConnectionTarget & {
    userId: string;
};
