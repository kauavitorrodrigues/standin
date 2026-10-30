import { EXIT_CODES } from "../consts/exitCodes";
import type { ExitCode } from "../types";

// The exits of commander that are not failures: help and version were asked
// for and commander has already written them.
export const COMMANDER_EXIT_CODES: Record<string, ExitCode> = {
    "commander.helpDisplayed": EXIT_CODES.OK,
    "commander.version": EXIT_CODES.OK,
};

// Commander's own text for these is not useful (it is "(outputHelp)" when no
// command was given).
export const COMMANDER_MESSAGES: Record<string, string> = {
    "commander.help": "a command is required.",
};
