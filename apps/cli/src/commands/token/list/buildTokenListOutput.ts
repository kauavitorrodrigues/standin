import type { ServiceToken } from "@standin/contracts";
import type { CommandOutput, TokenListResult } from "../../../types";
import { toTokenRow } from "../../../utils/toTokenRow";
import { TOKEN_LIST_MESSAGES } from "./consts";

export const buildTokenListOutput = (tokens: ServiceToken[]): CommandOutput => {
    const now: Date = new Date();
    const result: TokenListResult = {
        tokens: tokens.map((token) => toTokenRow(token, now)),
    };
    if (result.tokens.length === 0) {
        return { result, lines: [TOKEN_LIST_MESSAGES.empty] };
    }
    const lines: string[] = result.tokens.map((row) =>
        TOKEN_LIST_MESSAGES.row(
            row.prefix,
            row.name,
            row.scopes.join(", "),
            row.status,
            row.id
        )
    );
    return { result, lines };
};
