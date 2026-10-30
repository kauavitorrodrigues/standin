import { NETWORK_ERROR_CODES } from "../consts/network";
import { findErrorCode } from "./findErrorCode";

export const isNetworkError = (error: unknown): boolean => {
    const code: string | undefined = findErrorCode(error);
    if (!code) return false;
    return NETWORK_ERROR_CODES[code] === true;
};
