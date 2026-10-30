// What `standin login` keeps for the next runs.
export type CliConfigFile = {
    url?: string;
    token?: string;
};

// The file of the user, behind a seam so the tests use a folder of their own.
export type ConfigStore = {
    // Where the file is (or would be). Safe to print, it holds no secret.
    path: string;
    read: () => Promise<CliConfigFile | undefined>;
    write: (file: CliConfigFile) => Promise<void>;
    // True when there was a file to delete.
    remove: () => Promise<boolean>;
};

// The flags that point a command at an instance.
export type RemoteArgs = {
    url?: string;
    token?: string;
};

// Where and as whom a remote command runs, both known.
export type RemoteTarget = {
    url: string;
    token: string;
};

export type LoginArgs = RemoteArgs;

// Logout takes no arguments of its own.
export type LogoutArgs = Record<never, never>;

export type LoginResult = {
    dryRun: boolean;
    url: string;
    configPath: string;
};

export type LogoutResult = {
    dryRun: boolean;
    configPath: string;
    removed: boolean;
};

// Why a URL is refused: it is not an address, or it is http for a remote host.
export type RemoteUrlProblem = "INVALID" | "INSECURE";
