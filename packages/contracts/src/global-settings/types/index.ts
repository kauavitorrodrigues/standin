import type {
    GLOBAL_SETTING_KEYS,
    ORGANIZATION_INVITE_LINK_ROLES,
} from "../consts";

export type GlobalSettingKey = (typeof GLOBAL_SETTING_KEYS)[number];

export type GlobalSettings = Record<GlobalSettingKey, boolean>;

// The part of the settings anyone may read before signing in, so the sign up
// page can adapt.
export type PublicGlobalSettings = Pick<GlobalSettings, "allowSignup">;

// What the signed in person may create here. The admin always may.
export type GlobalCapabilities = {
    canCreateOrganization: boolean;
    canCreateSpace: boolean;
};

export type OrganizationInviteLinkRole =
    (typeof ORGANIZATION_INVITE_LINK_ROLES)[number];

// What the page of a link shows before the person signs up.
export type OrganizationInvitePreview = {
    organizationName: string;
    inviterName: string | null;
    role: OrganizationInviteLinkRole;
    // Set when the invitation is for one e-mail: the account must use it.
    email: string | null;
};

// A row of the admin lists.
export type AdminUserSummary = {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
};

export type AdminOrganizationSummary = {
    id: string;
    name: string;
    slug: string;
    ownerId: string;
    memberCount: number;
    createdAt: string;
};
