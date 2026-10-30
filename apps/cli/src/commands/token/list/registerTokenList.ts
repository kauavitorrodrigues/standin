import type { Command } from "commander";
import { runCommand } from "../../../program/runCommand";
import type { CliRuntime, TokenListArgs } from "../../../types";
import {
    TOKEN_LIST_COMMAND,
    TOKEN_LIST_DESCRIPTION,
    TOKEN_LIST_HELP,
    TOKEN_LIST_NAME,
} from "./consts";
import { runTokenList } from "./runTokenList";

export const registerTokenList = (
    token: Command,
    runtime: CliRuntime
): void => {
    token
        .command(TOKEN_LIST_COMMAND)
        .description(TOKEN_LIST_DESCRIPTION)
        .addHelpText("after", TOKEN_LIST_HELP)
        .action((_options, command: Command) =>
            runCommand(
                TOKEN_LIST_NAME,
                command.optsWithGlobals<TokenListArgs>(),
                runtime,
                runTokenList
            )
        );
};
