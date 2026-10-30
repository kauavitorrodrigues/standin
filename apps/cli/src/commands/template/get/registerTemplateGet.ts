import type { Command } from "commander";
import { runCommand } from "../../../program/runCommand";
import type { CliRuntime, TemplateGetArgs } from "../../../types";
import { addRemoteOptions } from "../../shared/addRemoteOptions";
import {
    TEMPLATE_GET_COMMAND,
    TEMPLATE_GET_DESCRIPTION,
    TEMPLATE_GET_HELP,
    TEMPLATE_GET_NAME,
} from "./consts";
import { runTemplateGet } from "./runTemplateGet";

export const registerTemplateGet = (
    template: Command,
    runtime: CliRuntime
): void => {
    addRemoteOptions(
        template
            .command(TEMPLATE_GET_COMMAND)
            .description(TEMPLATE_GET_DESCRIPTION)
            .argument("<id>", "id of the template")
    )
        .addHelpText("after", TEMPLATE_GET_HELP)
        .action((id: string, _options, command: Command) =>
            runCommand(
                TEMPLATE_GET_NAME,
                { ...command.optsWithGlobals<TemplateGetArgs>(), id },
                runtime,
                runTemplateGet
            )
        );
};
