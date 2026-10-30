import type { Command } from "commander";
import { runCommand } from "../../program/runCommand";
import type { CliRuntime, LoginArgs } from "../../types";
import { addRemoteOptions } from "../shared/addRemoteOptions";
import { LOGIN_COMMAND, LOGIN_DESCRIPTION, LOGIN_HELP } from "./consts";
import { runLogin } from "./runLogin";

export const registerLogin = (program: Command, runtime: CliRuntime): void => {
    addRemoteOptions(
        program.command(LOGIN_COMMAND).description(LOGIN_DESCRIPTION)
    )
        .addHelpText("after", LOGIN_HELP)
        .action((_options, command: Command) =>
            runCommand(
                LOGIN_COMMAND,
                command.optsWithGlobals<LoginArgs>(),
                runtime,
                runLogin
            )
        );
};
