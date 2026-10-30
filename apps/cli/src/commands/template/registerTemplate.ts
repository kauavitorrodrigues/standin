import type { Command } from "commander";
import type { CliRuntime } from "../../types";
import { TEMPLATE_COMMAND, TEMPLATE_DESCRIPTION } from "./consts";
import { registerTemplateCreate } from "./create/registerTemplateCreate";
import { registerTemplateGet } from "./get/registerTemplateGet";
import { registerTemplateList } from "./list/registerTemplateList";
import { registerTemplatePublish } from "./publish/registerTemplatePublish";

export const registerTemplate = (
    program: Command,
    runtime: CliRuntime
): void => {
    const template: Command = program
        .command(TEMPLATE_COMMAND)
        .description(TEMPLATE_DESCRIPTION);

    registerTemplateCreate(template, runtime);
    registerTemplateGet(template, runtime);
    registerTemplateList(template, runtime);
    registerTemplatePublish(template, runtime);
};
