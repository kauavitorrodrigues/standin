import type { Command } from "commander";
import { runCommand } from "../../../program/runCommand";
import type { CliRuntime, MapValidateArgs } from "../../../types";
import { addRemoteOptions } from "../../shared/addRemoteOptions";
import {
    MAP_VALIDATE_COMMAND,
    MAP_VALIDATE_DESCRIPTION,
    MAP_VALIDATE_HELP,
    MAP_VALIDATE_NAME,
} from "./consts";
import { runMapValidate } from "./runMapValidate";

export const registerMapValidate = (
    map: Command,
    runtime: CliRuntime
): void => {
    addRemoteOptions(
        map
            .command(MAP_VALIDATE_COMMAND)
            .description(MAP_VALIDATE_DESCRIPTION)
            .argument("<spec>", "YAML or JSON spec file")
            .requiredOption("--map <id>", "id of the map to build the spec on")
    )
        .addHelpText("after", MAP_VALIDATE_HELP)
        .action((spec: string, _options, command: Command) =>
            runCommand(
                MAP_VALIDATE_NAME,
                { ...command.optsWithGlobals<MapValidateArgs>(), spec },
                runtime,
                runMapValidate
            )
        );
};
