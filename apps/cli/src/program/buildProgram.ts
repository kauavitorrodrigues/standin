import { Command } from "commander";
import { registerBootstrap } from "../commands/bootstrap/registerBootstrap";
import { registerHealth } from "../commands/health/registerHealth";
import { registerLibraryList } from "../commands/library/registerLibraryList";
import { registerLogin } from "../commands/login/registerLogin";
import { registerLogout } from "../commands/logout/registerLogout";
import { registerMap } from "../commands/map/registerMap";
import { registerSchemaPrint } from "../commands/schema/registerSchemaPrint";
import { registerSeedLibrary } from "../commands/seedLibrary/registerSeedLibrary";
import { registerToken } from "../commands/token/registerToken";
import type { CliRuntime } from "../types";
import { PROGRAM_DESCRIPTION, PROGRAM_HELP } from "./consts";

export const buildProgram = (runtime: CliRuntime): Command => {
    const program = new Command("standin")
        .description(PROGRAM_DESCRIPTION)
        .option("--json", "print one JSON document instead of text")
        .option("--yes", "skip confirmations (accepted by every command)")
        .option(
            "--dry-run",
            "check the input and say what would happen, write nothing"
        )
        // Commander must not exit the process nor print on its own: the
        // runner owns the output and the exit code. Set before the commands
        // are added so that they inherit it.
        .exitOverride()
        .configureOutput({
            writeOut: runtime.io.out,
            writeErr: runtime.io.err,
            outputError: () => {},
        })
        .addHelpText("after", PROGRAM_HELP);

    registerBootstrap(program, runtime);
    registerSeedLibrary(program, runtime);
    registerHealth(program, runtime);
    registerToken(program, runtime);
    registerLogin(program, runtime);
    registerLogout(program, runtime);
    registerMap(program, runtime);
    registerLibraryList(program, runtime);
    registerSchemaPrint(program, runtime);
    return program;
};
