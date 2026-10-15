// App-level role stored on the user. ADMIN manages the whole application,
// USER has no global privileges (organization roles live on the membership).
export const USER_ROLES = {
    ADMIN: "ADMIN",
    USER: "USER",
} as const;
