import { MESSAGES } from "../../../consts/messages";
import type { CommandOutput, TokenRevokeResult } from "../../../types";
import { TOKEN_REVOKE_MESSAGES } from "./consts";

export const buildTokenRevokeDryRunOutput = (id: string): CommandOutput => {
    const result: TokenRevokeResult = { dryRun: true, id };
    return {
        result,
        lines: [
            MESSAGES.inputValid,
            TOKEN_REVOKE_MESSAGES.plan(id),
            MESSAGES.dryRunNoDatabase,
        ],
    };
};
