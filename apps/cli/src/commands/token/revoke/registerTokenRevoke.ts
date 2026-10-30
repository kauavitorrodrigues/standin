import type { Command } from "commander";
import { runCommand } from "../../../program/runCommand";
import type { CliRuntime, TokenRevokeArgs } from "../../../types";
import {
    TOKEN_REVOKE_COMMAND,
    TOKEN_REVOKE_DESCRIPTION,
    TOKEN_REVOKE_HELP,
    TOKEN_REVOKE_NAME,
} from "./consts";
import { runTokenRevoke } from "./runTokenRevoke";

export const registerTokenRevoke = (
    token: Command,
    runtime: CliRuntime
): void => {
    token
        .command(TOKEN_REVOKE_COMMAND)
        .description(TOKEN_REVOKE_DESCRIPTION)
        .argument("<id>", "id of the token (see `token list`)")
        .addHelpText("after", TOKEN_REVOKE_HELP)
        .action((id: string, _options, command: Command) =>
            runCommand(
                TOKEN_REVOKE_NAME,
                { ...command.optsWithGlobals<TokenRevokeArgs>(), id },
                runtime,
                runTokenRevoke
            )
        );
};
