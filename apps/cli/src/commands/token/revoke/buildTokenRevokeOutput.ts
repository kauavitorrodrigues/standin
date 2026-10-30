import type { ServiceToken } from "@standin/contracts";
import type { CommandOutput, TokenRevokeResult } from "../../../types";
import { TOKEN_REVOKE_MESSAGES } from "./consts";

export const buildTokenRevokeOutput = (token: ServiceToken): CommandOutput => {
    const result: TokenRevokeResult = {
        dryRun: false,
        id: token.id,
        revokedAt: token.revokedAt,
    };
    return {
        result,
        lines: [TOKEN_REVOKE_MESSAGES.revoked(token.name, token.tokenPrefix)],
    };
};
