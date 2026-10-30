import { UnexpectedFailure } from "./UnexpectedFailure";

// The error of a path that is not there, as the file system gives it.
export const createMissingError = (path: string): UnexpectedFailure =>
    new UnexpectedFailure(`no such file: ${path}`, "ENOENT");
