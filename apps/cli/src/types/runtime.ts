import type { BootstrapInput, PublicHealthReport } from "@standin/contracts";
import type {
    BootstrapInstanceResult,
    LibrarySeed,
    LibrarySeedResult,
} from "@standin/core";
import type { EXIT_CODES } from "../consts/exitCodes";

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
};
