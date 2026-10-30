import type { Command } from "commander";
import type { CliRuntime } from "../../types";
import { MAP_COMMAND, MAP_DESCRIPTION } from "./consts";
import { registerMapApply } from "./apply/registerMapApply";
import { registerMapValidate } from "./validate/registerMapValidate";

export const registerMap = (program: Command, runtime: CliRuntime): void => {
    const map: Command = program
        .command(MAP_COMMAND)
        .description(MAP_DESCRIPTION);

    registerMapValidate(map, runtime);
    registerMapApply(map, runtime);
};
