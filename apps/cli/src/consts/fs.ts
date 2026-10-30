// Codes of the file system errors that mean the folder cannot be read.
export const FOLDER_ERROR_CODES: Record<string, true> = {
    ENOENT: true,
    EACCES: true,
    EPERM: true,
    EISDIR: true,
    ENOTDIR: true,
    ELOOP: true,
    EMFILE: true,
    ENAMETOOLONG: true,
};

// Errors of the reading itself: broken JSON, or a library.json that breaks
// the schema.
export const FOLDER_ERROR_NAMES: Record<string, true> = {
    SyntaxError: true,
    ZodError: true,
};

// The code of a file that is not there.
export const MISSING_FILE_CODE: string = "ENOENT";

// The code reported for a failure that carries none.
export const UNKNOWN_CODE: string = "UNKNOWN";
