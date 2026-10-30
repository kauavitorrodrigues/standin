import type { Command } from "commander";
import { runCommand } from "../../../program/runCommand";
import type { CliRuntime, MapApplyArgs } from "../../../types";
import { addRemoteOptions } from "../../shared/addRemoteOptions";
import { parseBaseVersion } from "../shared/parseBaseVersion";
import {
    MAP_APPLY_COMMAND,
    MAP_APPLY_DESCRIPTION,
    MAP_APPLY_HELP,
    MAP_APPLY_NAME,
} from "./consts";
import { runMapApply } from "./runMapApply";

export const registerMapApply = (map: Command, runtime: CliRuntime): void => {
    addRemoteOptions(
        map
            .command(MAP_APPLY_COMMAND)
            .description(MAP_APPLY_DESCRIPTION)
            .argument("<spec>", "YAML or JSON spec file")
            .requiredOption("--map <id>", "id of the map to apply the spec to")
            .option(
                "--base-version <n>",
                "layout version the spec was built on (default: the current one)",
                parseBaseVersion
            )
    )
        .addHelpText("after", MAP_APPLY_HELP)
        .action((spec: string, _options, command: Command) =>
            runCommand(
                MAP_APPLY_NAME,
                { ...command.optsWithGlobals<MapApplyArgs>(), spec },
                runtime,
                runMapApply
            )
        );
};
