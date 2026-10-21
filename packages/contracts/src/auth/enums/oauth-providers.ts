// Login providers the instance can offer. Only GitHub exists today, the
// identities table already takes a generic provider.
export const OAUTH_PROVIDERS = {
    GITHUB: "github",
} as const;
