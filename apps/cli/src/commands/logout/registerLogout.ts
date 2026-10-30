import type { Command } from "commander";
import { runCommand } from "../../program/runCommand";
import type { CliRuntime, LogoutArgs } from "../../types";
import { LOGOUT_COMMAND, LOGOUT_DESCRIPTION, LOGOUT_HELP } from "./consts";
import { runLogout } from "./runLogout";

export const registerLogout = (program: Command, runtime: CliRuntime): void => {
    program
        .command(LOGOUT_COMMAND)
        .description(LOGOUT_DESCRIPTION)
        .addHelpText("after", LOGOUT_HELP)
        .action((_options, command: Command) =>
            runCommand(
                LOGOUT_COMMAND,
                command.optsWithGlobals<LogoutArgs>(),
                runtime,
                runLogout
            )
        );
};
