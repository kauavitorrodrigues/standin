export type CliErrorHints = {
    // The input that was wrong, such as `--email`.
    path?: string;
    // What to do about it, ready to be followed.
    fix?: string;
};

export type ErrorReport = CliErrorHints & {
    code: string;
    message: string;
};

// What went wrong when reading the library folder, as an object with the
// fields the readers set.
export type ReadFailure = {
    message?: string;
    issues?: { path: PropertyKey[]; message: string }[];
};

// The fields an error may carry: the `code` of a system or driver error, and
// the error that caused it.
export type CodedError = {
    name?: string;
    code?: unknown;
    cause?: unknown;
};
