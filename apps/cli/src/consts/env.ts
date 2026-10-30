// The variables a command reads when its flag is not given.
export const ENV_NAMES = {
    ADMIN_EMAIL: "ADMIN_EMAIL",
    ADMIN_PASSWORD: "ADMIN_PASSWORD",
    ADMIN_NAME: "ADMIN_NAME",
    ORGANIZATION_NAME: "ORGANIZATION_NAME",
    // Where a remote command sends its requests, and as whom.
    STANDIN_URL: "STANDIN_URL",
    STANDIN_TOKEN: "STANDIN_TOKEN",
    // Where the file of `standin login` lives.
    XDG_CONFIG_HOME: "XDG_CONFIG_HOME",
    HOME: "HOME",
    // Set by pnpm to the folder the user typed the command in.
    INIT_CWD: "INIT_CWD",
} as const;
