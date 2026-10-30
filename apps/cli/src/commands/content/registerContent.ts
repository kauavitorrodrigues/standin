import type { Command } from "commander";
import type { CliRuntime } from "../../types";
import { registerContentApply } from "./apply/registerContentApply";
import { CONTENT_COMMAND, CONTENT_DESCRIPTION } from "./consts";
import { registerContentValidate } from "./validate/registerContentValidate";

export const registerContent = (
    program: Command,
    runtime: CliRuntime
): void => {
    const content: Command = program
        .command(CONTENT_COMMAND)
        .description(CONTENT_DESCRIPTION);

    registerContentValidate(content, runtime);
    registerContentApply(content, runtime);
};
