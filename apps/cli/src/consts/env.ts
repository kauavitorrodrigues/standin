// The variables a command reads when its flag is not given.
export const ENV_NAMES = {
    ADMIN_EMAIL: "ADMIN_EMAIL",
    ADMIN_PASSWORD: "ADMIN_PASSWORD",
    ADMIN_NAME: "ADMIN_NAME",
    ORGANIZATION_NAME: "ORGANIZATION_NAME",
    // Set by pnpm to the folder the user typed the command in.
    INIT_CWD: "INIT_CWD",
} as const;
