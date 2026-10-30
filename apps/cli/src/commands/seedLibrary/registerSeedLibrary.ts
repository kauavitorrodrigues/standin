import type { Command } from "commander";
import { runCommand } from "../../program/runCommand";
import type { CliRuntime, SeedLibraryArgs } from "../../types";
import {
    SEED_COMMAND,
    SEED_LIBRARY_COMMAND,
    SEED_LIBRARY_DESCRIPTION,
    SEED_LIBRARY_HELP,
    SEED_LIBRARY_NAME,
} from "./consts";
import { runSeedLibrary } from "./runSeedLibrary";

export const registerSeedLibrary = (
    program: Command,
    runtime: CliRuntime
): void => {
    const seed = program
        .command(SEED_COMMAND)
        .description("Seed data into the instance.");

    seed.command(SEED_LIBRARY_COMMAND)
        .description(SEED_LIBRARY_DESCRIPTION)
        .argument("[folder]", "folder with library.json and its PNGs")
        .addHelpText("after", SEED_LIBRARY_HELP)
        .action((folder: string | undefined, _options, command: Command) =>
            runCommand(
                SEED_LIBRARY_NAME,
                { ...command.optsWithGlobals<SeedLibraryArgs>(), folder },
                runtime,
                runSeedLibrary
            )
        );
};
