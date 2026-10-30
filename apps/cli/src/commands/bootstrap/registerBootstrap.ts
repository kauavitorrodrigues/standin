import type { Command } from "commander";
import { runCommand } from "../../program/runCommand";
import type { BootstrapArgs, CliRuntime } from "../../types";
import {
    BOOTSTRAP_COMMAND,
    BOOTSTRAP_DESCRIPTION,
    BOOTSTRAP_HELP,
} from "./consts";
import { runBootstrap } from "./runBootstrap";

export const registerBootstrap = (
    program: Command,
    runtime: CliRuntime
): void => {
    program
        .command(BOOTSTRAP_COMMAND)
        .description(BOOTSTRAP_DESCRIPTION)
        .option("--email <email>", "email of the admin")
        .option("--password <password>", "password of the admin")
        .option("--name <name>", "name of the admin")
        .option("--organization <name>", "name of the organization")
        .addHelpText("after", BOOTSTRAP_HELP)
        .action((_options: BootstrapArgs, command: Command) =>
            runCommand(
                BOOTSTRAP_COMMAND,
                command.optsWithGlobals<BootstrapArgs>(),
                runtime,
                runBootstrap
            )
        );
};
