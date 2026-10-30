import type { Command } from "commander";
import { runCommand } from "../../../program/runCommand";
import type { CliRuntime, ContentValidateArgs } from "../../../types";
import {
    CONTENT_VALIDATE_COMMAND,
    CONTENT_VALIDATE_DESCRIPTION,
    CONTENT_VALIDATE_HELP,
    CONTENT_VALIDATE_NAME,
} from "./consts";
import { runContentValidate } from "./runContentValidate";

export const registerContentValidate = (
    content: Command,
    runtime: CliRuntime
): void => {
    content
        .command(CONTENT_VALIDATE_COMMAND)
        .description(CONTENT_VALIDATE_DESCRIPTION)
        .argument("<folder>", "content folder")
        .addHelpText("after", CONTENT_VALIDATE_HELP)
        .action((folder: string, _options, command: Command) =>
            runCommand(
                CONTENT_VALIDATE_NAME,
                { ...command.optsWithGlobals<ContentValidateArgs>(), folder },
                runtime,
                runContentValidate
            )
        );
};
