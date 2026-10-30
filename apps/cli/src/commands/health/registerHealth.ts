import type { Command } from "commander";
import { runCommand } from "../../program/runCommand";
import type { CliRuntime, HealthArgs } from "../../types";
import { HEALTH_COMMAND, HEALTH_DESCRIPTION, HEALTH_HELP } from "./consts";
import { runHealth } from "./runHealth";

export const registerHealth = (program: Command, runtime: CliRuntime): void => {
    program
        .command(HEALTH_COMMAND)
        .description(HEALTH_DESCRIPTION)
        .addHelpText("after", HEALTH_HELP)
        .action((_options, command: Command) =>
            runCommand(
                HEALTH_COMMAND,
                command.optsWithGlobals<HealthArgs>(),
                runtime,
                runHealth
            )
        );
};
