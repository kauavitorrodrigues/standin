import type { CommandOutput, LogoutResult } from "../../types";
import { LOGOUT_MESSAGES } from "./consts";

export const buildLogoutOutput = (result: LogoutResult): CommandOutput => {
    if (result.dryRun) {
        return { result, lines: [LOGOUT_MESSAGES.dryRun(result.configPath)] };
    }
    if (!result.removed) {
        return { result, lines: [LOGOUT_MESSAGES.nothing(result.configPath)] };
    }
    return { result, lines: [LOGOUT_MESSAGES.removed(result.configPath)] };
};
