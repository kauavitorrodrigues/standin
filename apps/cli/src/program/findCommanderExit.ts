import { CommanderError } from "commander";
import type { ExitCode } from "../types";
import { COMMANDER_EXIT_CODES } from "./commanderCodes";

// The exit code of a help or version exit, undefined for a real failure.
export const findCommanderExit = (error: unknown): ExitCode | undefined => {
    if (!(error instanceof CommanderError)) return undefined;
    return COMMANDER_EXIT_CODES[error.code];
};
