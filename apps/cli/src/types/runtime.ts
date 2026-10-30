import type { BootstrapInput, PublicHealthReport } from "@standin/contracts";
import type {
    BootstrapInstanceResult,
    LibrarySeed,
    CreateServiceTokenInput,
    LibrarySeedResult,
} from "@standin/core";
import type { CreatedServiceToken, ServiceToken } from "@standin/contracts";
import type { EXIT_CODES } from "../consts/exitCodes";
import type { HttpTransport } from "./api";
import type { ConfigStore } from "./config";
import type { CliFiles } from "./files";
import type { TokenAdmin } from "./token";

export type ExitCode = (typeof EXIT_CODES)[keyof typeof EXIT_CODES];

export type CliEnv = Record<string, string | undefined>;

// Where a command writes and whether it may ask. `out` and `err` take raw
// text, the caller adds the line breaks.
export type CliIo = {
    out: (text: string) => void;
    err: (text: string) => void;
    // True when both stdin and stdout are terminals.
    isInteractive: boolean;
    ask: (question: string) => Promise<string | undefined>;
};

// What the commands need from the core. Real runs load the core on first use.
export type CliServices = {
    bootstrapInstance: (
        input: BootstrapInput
    ) => Promise<BootstrapInstanceResult>;
    // Reads the folder, or gives the default library when there is none.
    loadLibrary: (folder: string | undefined) => Promise<LibrarySeed>;
    seedLibrary: (seed: LibrarySeed) => Promise<LibrarySeedResult>;
    getHealth: () => Promise<PublicHealthReport>;
    // The admins that can own a service token.
    listActiveAdmins: () => Promise<TokenAdmin[]>;
    createServiceToken: (
        createdById: string,
        input: CreateServiceTokenInput
    ) => Promise<CreatedServiceToken>;
    listServiceTokens: () => Promise<ServiceToken[]>;
    revokeServiceToken: (id: string) => Promise<ServiceToken>;
};

export type GlobalFlags = {
    json?: boolean;
    yes?: boolean;
    dryRun?: boolean;
};

export type CommandContext<Args> = {
    args: Args & GlobalFlags;
    env: CliEnv;
    io: CliIo;
    services: CliServices;
    http: HttpTransport;
    config: ConfigStore;
    files: CliFiles;
};

// What a command hands back: the data for `--json` and the lines for people.
export type CommandOutput = {
    result: object;
    lines: string[];
};

export type CliRuntime = {
    env: CliEnv;
    io: CliIo;
    services: CliServices;
    // The seams of the remote commands: the network, the login file and the
    // files of the user. The tests replace them.
    http: HttpTransport;
    config: ConfigStore;
    files: CliFiles;
};
