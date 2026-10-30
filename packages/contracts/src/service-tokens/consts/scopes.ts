// What a service token may do. A token has no admin scope on purpose: the
// routes that manage tokens only accept an admin session. Reading and writing
// are separate scopes: writing a resource does not let a token read it.
export const SERVICE_TOKEN_SCOPES = [
    "library:read",
    "library:write",
    "maps:read",
    "maps:write",
    "templates:read",
    "templates:write",
] as const;
