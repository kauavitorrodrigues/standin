import type { LibrarySeed } from "@standin/core";
import type {
    CommandContext,
    CommandOutput,
    SeedLibraryArgs,
} from "../../types";
import { buildSeedDryRunOutput } from "./buildSeedDryRunOutput";
import { buildSeedOutput } from "./buildSeedOutput";
import { loadLibrary } from "./loadLibrary";

export const runSeedLibrary = async ({
    args,
    env,
    services,
}: CommandContext<SeedLibraryArgs>): Promise<CommandOutput> => {
    const seed: LibrarySeed = await loadLibrary(services, args.folder, env);

    if (args.dryRun) return buildSeedDryRunOutput(seed);
    return buildSeedOutput(await services.seedLibrary(seed));
};
