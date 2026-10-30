import { FLAGS } from "../../../consts/flags";
import type { Command } from "commander";
import { runCommand } from "../../../program/runCommand";
import type { CliRuntime, ContentApplyArgs } from "../../../types";
import { addRemoteOptions } from "../../shared/addRemoteOptions";
import {
    CONTENT_APPLY_COMMAND,
    CONTENT_APPLY_DESCRIPTION,
    CONTENT_APPLY_HELP,
    CONTENT_APPLY_NAME,
} from "./consts";
import { runContentApply } from "./runContentApply";

export const registerContentApply = (
    content: Command,
    runtime: CliRuntime
): void => {
    addRemoteOptions(
        content
            .command(CONTENT_APPLY_COMMAND)
            .description(CONTENT_APPLY_DESCRIPTION)
            .argument("<folder>", "content folder")
            .option(
                FLAGS.PUBLISH,
                "publish the templates it makes, and a complete draft found by name"
            )
    )
        .addHelpText("after", CONTENT_APPLY_HELP)
        .action((folder: string, _options, command: Command) =>
            runCommand(
                CONTENT_APPLY_NAME,
                { ...command.optsWithGlobals<ContentApplyArgs>(), folder },
                runtime,
                runContentApply
            )
        );
};
