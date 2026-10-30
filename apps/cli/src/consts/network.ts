// Codes of the errors that say a server cannot be reached.
export const NETWORK_ERROR_CODES: Record<string, true> = {
    ECONNREFUSED: true,
    ENOTFOUND: true,
    ETIMEDOUT: true,
    ECONNRESET: true,
    EHOSTUNREACH: true,
    ENETUNREACH: true,
    EAI_AGAIN: true,
};

// How far down the chain of causes the search goes.
export const MAX_CAUSE_DEPTH = 5;
