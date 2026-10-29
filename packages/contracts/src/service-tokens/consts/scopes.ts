// What a service token may do. A token has no admin scope on purpose: the
// routes that manage tokens only accept an admin session.
export const SERVICE_TOKEN_SCOPES = [
    "library:write",
    "maps:write",
    "templates:write",
] as const;
