import type { z } from "zod/v4";
import type { ROLES } from "./enums/roles";
import type { OAUTH_PROVIDERS } from "./enums/oauth-providers";
import type { AuthProvidersSchema } from "./schemas/auth-providers.schema";

export type Role = (typeof ROLES)[keyof typeof ROLES];

export type OAuthProvider =
    (typeof OAUTH_PROVIDERS)[keyof typeof OAUTH_PROVIDERS];

export type AuthProviders = z.infer<typeof AuthProvidersSchema>;
