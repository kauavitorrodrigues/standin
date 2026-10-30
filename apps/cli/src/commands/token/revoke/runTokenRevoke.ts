import type { ServiceToken } from "@standin/contracts";
import { ConfirmationRequiredError } from "../../../errors/ConfirmationRequiredError";
import type {
    CommandContext,
    CommandOutput,
    TokenRevokeArgs,
} from "../../../types";
import { buildTokenRevokeDryRunOutput } from "./buildTokenRevokeDryRunOutput";
import { buildTokenRevokeOutput } from "./buildTokenRevokeOutput";
import { TOKEN_REVOKE_ACTION } from "./consts";
import { assertTokenId } from "./assertTokenId";
import { needsConfirmation } from "./needsConfirmation";

export const runTokenRevoke = async ({
    args,
    io,
    services,
}: CommandContext<TokenRevokeArgs>): Promise<CommandOutput> => {
    assertTokenId(args.id);
    if (args.dryRun) return buildTokenRevokeDryRunOutput(args.id);
    if (needsConfirmation(io, args)) {
        throw new ConfirmationRequiredError(TOKEN_REVOKE_ACTION);
    }

    const revoked: ServiceToken = await services.revokeServiceToken(args.id);
    return buildTokenRevokeOutput(revoked);
};
