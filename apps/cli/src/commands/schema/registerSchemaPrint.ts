import type { Command } from "commander";
import { runCommand } from "../../program/runCommand";
import type { CliRuntime, SchemaPrintArgs } from "../../types";
import {
    SCHEMA_COMMAND,
    SCHEMA_DESCRIPTION,
    SCHEMA_PRINT_COMMAND,
    SCHEMA_PRINT_DESCRIPTION,
    SCHEMA_PRINT_HELP,
    SCHEMA_PRINT_NAME,
} from "./consts";
import { runSchemaPrint } from "./runSchemaPrint";

export const registerSchemaPrint = (
    program: Command,
    runtime: CliRuntime
): void => {
    const schema: Command = program
        .command(SCHEMA_COMMAND)
        .description(SCHEMA_DESCRIPTION);

    schema
        .command(SCHEMA_PRINT_COMMAND)
        .description(SCHEMA_PRINT_DESCRIPTION)
        .argument("<kind>", "spec, library, library-tileset, library-asset...")
        .addHelpText("after", SCHEMA_PRINT_HELP)
        .action((kind: string, _options, command: Command) =>
            runCommand(
                SCHEMA_PRINT_NAME,
                { ...command.optsWithGlobals<SchemaPrintArgs>(), kind },
                runtime,
                runSchemaPrint
            )
        );
};
