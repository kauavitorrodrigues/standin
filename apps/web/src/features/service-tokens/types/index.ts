import type { LucideIcon } from "lucide-react";
import type {
    ServiceTokenScope,
    ServiceTokenScopeAction,
    ServiceTokenScopeResource,
} from "@standin/contracts";

export type ServiceTokenStatus = "active" | "expired" | "revoked";

// A resource of the matrix: how the form shows its row.
export type ServiceTokenResourceMeta = {
    label: string;
    description: string;
    icon: LucideIcon;
};

// A scope a token may have: how the list and the cell of the matrix name it.
export type ServiceTokenScopeMeta = {
    label: string;
    description: string;
    icon: LucideIcon;
};

// A row of the permissions matrix: one resource with its scopes.
export type ServiceTokenScopeGroup = ServiceTokenResourceMeta & {
    resource: ServiceTokenScopeResource;
    scopes: ServiceTokenScope[];
};

// A column of the permissions matrix: one action.
export type ServiceTokenScopeColumn = {
    action: ServiceTokenScopeAction;
    label: string;
};

// What a checkbox of the matrix shows for a set of scopes.
export type ServiceTokenScopeCheckedState = {
    checked: boolean;
    indeterminate: boolean;
};

export type ExpiryOptionId = "never" | "30d" | "90d" | "1y" | "custom";

// `days` is how far from today the token expires, or null when the option
// has no fixed distance (no expiry, or a date picked by hand).
export type ExpiryOption = {
    id: ExpiryOptionId;
    label: string;
    days: number | null;
};

// What the create form holds. `expiresOn` is the day from the date input
// ("2026-12-31"), used only with the "custom" expiry option.
export type CreateTokenFormValues = {
    name: string;
    scopes: ServiceTokenScope[];
    expiry: ExpiryOptionId;
    expiresOn: string;
};

export type CreateTokenField = "name" | "scopes" | "expiresOn";

export type CreateTokenFieldErrors = Partial<Record<CreateTokenField, string>>;

// The body of the creation request.
export type CreateTokenPayload = {
    name: string;
    scopes: ServiceTokenScope[];
    expiresAt?: string;
};

export type CreateTokenValidation =
    | { ok: true; payload: CreateTokenPayload }
    | { ok: false; errors: CreateTokenFieldErrors };

export type ServiceTokenActions = {
    canRegenerate: boolean;
    canRevoke: boolean;
    canDelete: boolean;
};

// The dialog the menu of a row opened, if any.
export type ServiceTokenAction = "regenerate" | "revoke" | "delete" | null;
