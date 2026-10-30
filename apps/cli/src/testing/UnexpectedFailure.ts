// An error that is not a BaseError, as a library or the runtime would throw.
// It can carry a `code`, as system errors do.
export class UnexpectedFailure extends Error {
    public readonly code?: string;

    constructor(message: string, code?: string) {
        super(message);
        this.code = code;
    }
}
