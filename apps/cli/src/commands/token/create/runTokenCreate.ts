import type {
    CreatedServiceToken,
    ServiceTokenCreateInput,
} from "@standin/contracts";
import { ENV_NAMES } from "../../../consts/env";
import type {
    CommandContext,
    CommandOutput,
    TokenAdmin,
    TokenCreateArgs,
} from "../../../types";
import { pickOption } from "../../../utils/pickOption";
import { resolveTokenAdmin } from "../shared/resolveTokenAdmin";
import { buildTokenCreateDryRunOutput } from "./buildTokenCreateDryRunOutput";
import { buildTokenCreateInput } from "./buildTokenCreateInput";
import { buildTokenCreateOutput } from "./buildTokenCreateOutput";

export const runTokenCreate = async ({
    args,
    env,
    services,
}: CommandContext<TokenCreateArgs>): Promise<CommandOutput> => {
    const input: ServiceTokenCreateInput = buildTokenCreateInput(args);
    const email: string | undefined = pickOption(
        args.admin,
        env[ENV_NAMES.ADMIN_EMAIL]
    );

    if (args.dryRun) return buildTokenCreateDryRunOutput(input, email);

    const owner: TokenAdmin = resolveTokenAdmin(
        await services.listActiveAdmins(),
        email
    );
    const created: CreatedServiceToken = await services.createServiceToken(
        owner.id,
        input
    );
    return buildTokenCreateOutput(created, owner);
};
