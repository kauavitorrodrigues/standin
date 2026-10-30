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

// A link as it is listed. The secret is kept only as a hash, so it exists once,
// in the answer that creates the link.
export type OrganizationInviteLink = {
    id: string;
    organizationId: string;
    createdBy: string | null;
    role: OrganizationInviteLinkRole;
    expiresAt: string;
    maxUses: number | null;
    usesCount: number;
    revokedAt: string | null;
    createdAt: string;
};

export type OrganizationInviteLinkCreated = OrganizationInviteLink & {
    token: string;
};

// What the page of a link shows before the person signs up.
export type OrganizationInvitePreview = {
    organizationName: string;
    inviterName: string | null;
    role: OrganizationInviteLinkRole;
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
