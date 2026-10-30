import type { Command } from "commander";
import { runCommand } from "../../program/runCommand";
import type { CliRuntime, LibraryListArgs } from "../../types";
import { addRemoteOptions } from "../shared/addRemoteOptions";
import {
    LIBRARY_COMMAND,
    LIBRARY_DESCRIPTION,
    LIBRARY_LIST_COMMAND,
    LIBRARY_LIST_DESCRIPTION,
    LIBRARY_LIST_HELP,
    LIBRARY_LIST_NAME,
} from "./consts";
import { runLibraryList } from "./runLibraryList";

export const registerLibraryList = (
    program: Command,
    runtime: CliRuntime
): void => {
    const library: Command = program
        .command(LIBRARY_COMMAND)
        .description(LIBRARY_DESCRIPTION);

    addRemoteOptions(
        library
            .command(LIBRARY_LIST_COMMAND)
            .description(LIBRARY_LIST_DESCRIPTION)
    )
        .addHelpText("after", LIBRARY_LIST_HELP)
        .action((_options, command: Command) =>
            runCommand(
                LIBRARY_LIST_NAME,
                command.optsWithGlobals<LibraryListArgs>(),
                runtime,
                runLibraryList
            )
        );
};
