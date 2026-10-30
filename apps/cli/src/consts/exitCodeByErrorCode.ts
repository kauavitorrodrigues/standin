import type { ExitCode } from "../types";
import { EXIT_CODES } from "./exitCodes";

// Domain errors whose exit code is not the one of their status. A missing
// admin is the state of the instance blocking the command: a conflict.
export const EXIT_CODE_BY_ERROR_CODE: Record<string, ExitCode> = {
    LIBRARY_SEED_ADMIN_NOT_FOUND: EXIT_CODES.CONFLICT,
};
