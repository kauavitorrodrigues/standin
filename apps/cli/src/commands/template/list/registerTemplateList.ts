import { FLAGS } from "../../../consts/flags";
import type { Command } from "commander";
import { runCommand } from "../../../program/runCommand";
import type { CliRuntime, TemplateListArgs } from "../../../types";
import { addRemoteOptions } from "../../shared/addRemoteOptions";
import { parseSizeTier } from "../shared/parseSizeTier";
import {
    TEMPLATE_LIST_COMMAND,
    TEMPLATE_LIST_DESCRIPTION,
    TEMPLATE_LIST_HELP,
    TEMPLATE_LIST_NAME,
} from "./consts";
import { runTemplateList } from "./runTemplateList";

export const registerTemplateList = (
    template: Command,
    runtime: CliRuntime
): void => {
    addRemoteOptions(
        template
            .command(TEMPLATE_LIST_COMMAND)
            .description(TEMPLATE_LIST_DESCRIPTION)
            .option(
                `${FLAGS.SIZE_TIER} <tier>`,
                "only the templates of this size tier: XS, S, M, L or XL",
                parseSizeTier
            )
    )
        .addHelpText("after", TEMPLATE_LIST_HELP)
        .action((_options, command: Command) =>
            runCommand(
                TEMPLATE_LIST_NAME,
                command.optsWithGlobals<TemplateListArgs>(),
                runtime,
                runTemplateList
            )
        );
};
