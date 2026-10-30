import type { ServiceTokenCreateInput } from "@standin/contracts";
import { MESSAGES } from "../../../consts/messages";
import type { CommandOutput, TokenCreateDryRunResult } from "../../../types";
import { TOKEN_CREATE_MESSAGES } from "./consts";

export const buildTokenCreateDryRunOutput = (
    input: ServiceTokenCreateInput,
    admin: string | undefined
): CommandOutput => {
    const result: TokenCreateDryRunResult = {
        dryRun: true,
        databaseChecked: false,
        input: {
            name: input.name,
            scopes: input.scopes,
            expiresAt: input.expiresAt?.toISOString() ?? null,
            admin: admin ?? null,
        },
    };
    const lines: string[] = [
        TOKEN_CREATE_MESSAGES.valid,
        TOKEN_CREATE_MESSAGES.plan(input.name, input.scopes.join(", ")),
        MESSAGES.dryRunNoDatabase,
    ];
    return { result, lines };
};
