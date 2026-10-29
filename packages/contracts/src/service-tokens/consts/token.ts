// Every service token starts with this, so a bearer token tells a service
// token from a session JWT without a lookup.
export const SERVICE_TOKEN_PREFIX = "sit_";

export const SERVICE_TOKEN_NAME_MAX_LENGTH = 100;
