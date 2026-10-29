import type { ServiceTokenScope } from "@standin/contracts";

export type AuthenticateOptions = {
    // Set by the routes that also accept a service token. Without it, only a
    // session (JWT or cookie) authenticates.
    scope?: ServiceTokenScope;
};
