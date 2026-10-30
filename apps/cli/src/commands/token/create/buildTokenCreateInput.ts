import { ServiceTokenCreateSchema } from "@standin/contracts";
import type { ServiceTokenCreateInput } from "@standin/contracts";
import { TokenInputInvalidError } from "../../../errors/TokenInputInvalidError";
import type {
    ErrorIssue,
    TokenCreateArgs,
    TokenInputParse,
} from "../../../types";

// The name, scopes and expiry checked with the schema the API uses to create a
// token, so the CLI and the admin screen accept the same input.
export const buildTokenCreateInput = (
    args: TokenCreateArgs
): ServiceTokenCreateInput => {
    const parsed: TokenInputParse = ServiceTokenCreateSchema.safeParse({
        name: args.name,
        scopes: args.scope,
        expiresAt: args.expiresAt,
    });
    if (parsed.success) return parsed.data;

    const issues: ErrorIssue[] = parsed.error.issues.map((issue) => ({
        path: issue.path.map(String).join("."),
        message: issue.message,
    }));
    throw new TokenInputInvalidError(issues);
};
