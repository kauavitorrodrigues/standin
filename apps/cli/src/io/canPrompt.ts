import type { CliIo, GlobalFlags } from "../types";

// Never ask without a terminal on both ends, and never in --json mode where
// stdout must hold the JSON and nothing else.
export const canPrompt = (io: CliIo, flags: GlobalFlags): boolean =>
    io.isInteractive && !flags.json;
