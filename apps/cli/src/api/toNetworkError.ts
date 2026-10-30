import { TIMEOUT_NETWORK_CODE, UNKNOWN_NETWORK_CODE } from "../consts/api";
import { ApiNetworkError } from "../errors/ApiNetworkError";
import { findErrorCode } from "../utils/findErrorCode";

const TIMEOUT_NAMES: Record<string, true> = {
    TimeoutError: true,
    AbortError: true,
};

// A failure of the transport as the error of the CLI, with the code that says
// why (ECONNREFUSED, ENOTFOUND, a timeout).
export const toNetworkError = (error: unknown): ApiNetworkError => {
    const code: string | undefined = findErrorCode(error);
    if (code) return new ApiNetworkError(code);
    const name: string = (error as Error | undefined)?.name ?? "";
    if (TIMEOUT_NAMES[name] === true) {
        return new ApiNetworkError(TIMEOUT_NETWORK_CODE);
    }
    return new ApiNetworkError(UNKNOWN_NETWORK_CODE);
};
