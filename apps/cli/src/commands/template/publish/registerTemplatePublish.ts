import type { Command } from "commander";
import { runCommand } from "../../../program/runCommand";
import type { CliRuntime, TemplatePublishArgs } from "../../../types";
import { addRemoteOptions } from "../../shared/addRemoteOptions";
import {
    TEMPLATE_PUBLISH_COMMAND,
    TEMPLATE_PUBLISH_DESCRIPTION,
    TEMPLATE_PUBLISH_HELP,
    TEMPLATE_PUBLISH_NAME,
} from "./consts";
import { runTemplatePublish } from "./runTemplatePublish";

export const registerTemplatePublish = (
    template: Command,
    runtime: CliRuntime
): void => {
    addRemoteOptions(
        template
            .command(TEMPLATE_PUBLISH_COMMAND)
            .description(TEMPLATE_PUBLISH_DESCRIPTION)
            .argument("<id>", "id of the template")
    )
        .addHelpText("after", TEMPLATE_PUBLISH_HELP)
        .action((id: string, _options, command: Command) =>
            runCommand(
                TEMPLATE_PUBLISH_NAME,
                { ...command.optsWithGlobals<TemplatePublishArgs>(), id },
                runtime,
                runTemplatePublish
            )
        );
};
