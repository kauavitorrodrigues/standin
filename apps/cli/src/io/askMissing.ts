import type { CliIo, GlobalFlags } from "../types";
import { canPrompt } from "./canPrompt";

// Asks for a value that is missing, only when a person can answer.
export const askMissing = async (
    io: CliIo,
    flags: GlobalFlags,
    question: string
): Promise<string | undefined> => {
    if (!canPrompt(io, flags)) return undefined;
    return (await io.ask(question))?.trim() || undefined;
};
