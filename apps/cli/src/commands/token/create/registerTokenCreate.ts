import type { Command } from "commander";
import { runCommand } from "../../../program/runCommand";
import type { CliRuntime, TokenCreateArgs } from "../../../types";
import {
    TOKEN_CREATE_COMMAND,
    TOKEN_CREATE_DESCRIPTION,
    TOKEN_CREATE_HELP,
    TOKEN_CREATE_NAME,
} from "./consts";
import { runTokenCreate } from "./runTokenCreate";

export const registerTokenCreate = (
    token: Command,
    runtime: CliRuntime
): void => {
    token
        .command(TOKEN_CREATE_COMMAND)
        .description(TOKEN_CREATE_DESCRIPTION)
        .requiredOption("--name <name>", "name of the token")
        .requiredOption("--scope <scope...>", "one or more scopes")
        .option("--expires-at <iso>", "expiry as an ISO 8601 UTC date")
        .option("--admin <email>", "email of the admin that owns the token")
        .addHelpText("after", TOKEN_CREATE_HELP)
        .action((_options, command: Command) =>
            runCommand(
                TOKEN_CREATE_NAME,
                command.optsWithGlobals<TokenCreateArgs>(),
                runtime,
                runTokenCreate
            )
        );
};
