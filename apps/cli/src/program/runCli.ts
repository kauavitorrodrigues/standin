import { EXIT_CODES } from "../consts/exitCodes";
import { resolveExitCode } from "../errors/resolveExitCode";
import { toErrorReport } from "../errors/toErrorReport";
import { writeFailure } from "../io/writeFailure";
import type { CliRuntime, ExitCode } from "../types";
import { buildProgram } from "./buildProgram";
import { findCommanderExit } from "./findCommanderExit";
import { toCliFailure } from "./toCliFailure";
import { wantsJson } from "../utils/wantsJson";

// Runs the CLI and gives back the exit code. It never exits the process, so
// the tests can call it.
export const runCli = async (
    argv: string[],
    runtime: CliRuntime
): Promise<ExitCode> => {
    const program = buildProgram(runtime);
    try {
        await program.parseAsync(argv, { from: "user" });
        return EXIT_CODES.OK;
    } catch (error) {
        const known: ExitCode | undefined = findCommanderExit(error);
        if (known !== undefined) return known;

        const failure: unknown = toCliFailure(error);
        writeFailure(runtime.io, toErrorReport(failure), wantsJson(argv));
        return resolveExitCode(failure);
    }
};
