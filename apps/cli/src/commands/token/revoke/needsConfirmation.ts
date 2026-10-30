import type { CliIo, GlobalFlags } from "../../../types";

// Only a person at a terminal is asked to confirm. A caller without one, or
// that wants JSON, is an agent and is never stopped. --dry-run changes
// nothing, so it needs no confirmation either.
export const needsConfirmation = (io: CliIo, flags: GlobalFlags): boolean => {
    if (flags.yes || flags.dryRun || flags.json) return false;
    return io.isInteractive;
};
