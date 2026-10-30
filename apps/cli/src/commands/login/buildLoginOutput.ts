import type { CommandOutput, LoginResult } from "../../types";
import { LOGIN_MESSAGES } from "./consts";

// Neither the result nor the lines carry the token.
export const buildLoginOutput = (result: LoginResult): CommandOutput => {
    if (result.dryRun) {
        return {
            result,
            lines: [
                LOGIN_MESSAGES.valid(result.url),
                LOGIN_MESSAGES.dryRun(result.configPath),
            ],
        };
    }
    return {
        result,
        lines: [LOGIN_MESSAGES.saved(result.url, result.configPath)],
    };
};
