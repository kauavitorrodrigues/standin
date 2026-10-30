import { FLAGS } from "../../../consts/flags";
import type { Command } from "commander";
import { runCommand } from "../../../program/runCommand";
import type { CliRuntime, TemplateCreateArgs } from "../../../types";
import { addRemoteOptions } from "../../shared/addRemoteOptions";
import { parseSizeTier } from "../shared/parseSizeTier";
import {
    TEMPLATE_CREATE_COMMAND,
    TEMPLATE_CREATE_DESCRIPTION,
    TEMPLATE_CREATE_HELP,
    TEMPLATE_CREATE_NAME,
} from "./consts";
import { runTemplateCreate } from "./runTemplateCreate";

export const registerTemplateCreate = (
    template: Command,
    runtime: CliRuntime
): void => {
    addRemoteOptions(
        template
            .command(TEMPLATE_CREATE_COMMAND)
            .description(TEMPLATE_CREATE_DESCRIPTION)
            .argument("<name>", "name of the template")
            .option(
                `${FLAGS.SIZE_TIER} <tier>`,
                "size tier of the map: XS, S, M, L or XL (default: the one of the spec)",
                parseSizeTier
            )
            .option(
                `${FLAGS.DESCRIPTION} <text>`,
                "description of the template"
            )
            .option(
                `${FLAGS.THUMBNAIL} <png>`,
                "PNG to upload as the thumbnail"
            )
            .option(
                `${FLAGS.SPEC} <file>`,
                "YAML or JSON spec of kind template to build on its map"
            )
            .option(
                FLAGS.PUBLISH,
                "publish the template once it is made (needs --thumbnail)"
            )
    )
        .addHelpText("after", TEMPLATE_CREATE_HELP)
        .action((name: string, _options, command: Command) =>
            runCommand(
                TEMPLATE_CREATE_NAME,
                { ...command.optsWithGlobals<TemplateCreateArgs>(), name },
                runtime,
                runTemplateCreate
            )
        );
};
