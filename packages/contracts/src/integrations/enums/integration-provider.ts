// The outside services an organization can connect. Add a value here, then a
// migration for the Postgres enum.
export const INTEGRATION_PROVIDERS = {
    SPOTIFY: "SPOTIFY",
} as const;

export type IntegrationProvider =
    (typeof INTEGRATION_PROVIDERS)[keyof typeof INTEGRATION_PROVIDERS];

// What a connection is used for. One provider can serve more than one.
export const INTEGRATION_SERVICES = {
    MUSIC: "MUSIC",
} as const;

export type IntegrationServiceKind =
    (typeof INTEGRATION_SERVICES)[keyof typeof INTEGRATION_SERVICES];
