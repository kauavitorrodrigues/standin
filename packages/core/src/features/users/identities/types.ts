import type { OAuthProvider, User } from "@standin/contracts";

// What identifies an account at a provider.
export type IdentityKey = {
    provider: OAuthProvider;
    providerUserId: string;
};

// The key plus the informative login, as the API read it from the provider.
export type IdentityInput = IdentityKey & {
    providerLogin: string;
};

export type LinkIdentityInput = {
    identity: IdentityInput;
    // The verified primary e-mail of the provider.
    email: string;
};

export type CreateFromIdentityInput = LinkIdentityInput & {
    name: string;
};

// `created` is false when another request created the person first.
export type CreateFromIdentityResult = {
    user: User;
    created: boolean;
};
