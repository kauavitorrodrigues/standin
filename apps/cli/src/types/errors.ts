// One problem the server or the local checks found, as a list entry. `opIndex`
// is set when the problem belongs to an operation of the ops sent.
export type ErrorIssue = {
    // The file of a content folder the problem is in, relative to the folder.
    file?: string;
    opIndex?: number;
    code?: string;
    path?: string;
    message: string;
};

// Extra facts an error carries for the JSON output, such as the version a
// stale apply should have used.
export type ErrorDetails = Record<string, unknown>;

export type CliErrorHints = {
    // The input that was wrong, such as `--email`.
    path?: string;
    // What to do about it, ready to be followed.
    fix?: string;
    // What the server or the local checks found wrong, one entry each.
    issues?: ErrorIssue[];
    details?: ErrorDetails;
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
