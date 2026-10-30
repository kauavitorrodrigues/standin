// The switches an instance admin can change. Every one defaults to open, so an
// instance that is upgraded behaves as before.
export const GLOBAL_SETTING_KEYS = [
    "allowSignup",
    "allowOrganizationCreation",
    "allowSpaceCreation",
] as const;

export const DEFAULT_GLOBAL_SETTINGS = {
    allowSignup: true,
    allowOrganizationCreation: true,
    allowSpaceCreation: true,
} as const;

// The environment variable that seeds each switch on a fresh instance.
export const GLOBAL_SETTING_ENV_KEYS = {
    allowSignup: "ALLOW_SIGNUP",
    allowOrganizationCreation: "ALLOW_ORGANIZATION_CREATION",
    allowSpaceCreation: "ALLOW_SPACE_CREATION",
} as const;

// What a link can grant. Never an owner: the link only brings people in.
export const ORGANIZATION_INVITE_LINK_ROLES = ["MEMBER"] as const;
