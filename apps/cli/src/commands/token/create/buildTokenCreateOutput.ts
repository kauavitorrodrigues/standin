import type { CreatedServiceToken } from "@standin/contracts";
import type {
    CommandOutput,
    TokenAdmin,
    TokenCreateResult,
    TokenRow,
} from "../../../types";
import { toTokenRow } from "../../../utils/toTokenRow";
import { TOKEN_CREATE_MESSAGES } from "./consts";

// The only place the clear token is printed.
export const buildTokenCreateOutput = (
    created: CreatedServiceToken,
    owner: TokenAdmin
): CommandOutput => {
    const row: TokenRow = toTokenRow(created.serviceToken, new Date());
    const result: TokenCreateResult = {
        token: created.token,
        serviceToken: row,
        owner: owner.email,
    };
    const lines: string[] = [
        TOKEN_CREATE_MESSAGES.created(row.name, row.prefix, owner.email),
        TOKEN_CREATE_MESSAGES.secret(created.token),
    ];
    return { result, lines };
};
