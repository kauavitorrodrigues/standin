const PARAMS_MARKER = "\nparams:";

// The message of the cause, cut before the bound parameters that a query
// error appends (they can hold emails and hashes).
export const readCauseMessage = (error: unknown): string | undefined => {
    if (!(error instanceof Error)) return undefined;
    if (!(error.cause instanceof Error)) return undefined;
    const [message] = error.cause.message.split(PARAMS_MARKER);
    return message.trim() || undefined;
};
