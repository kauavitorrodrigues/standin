import { parseBootstrapInput } from "@standin/contracts";
import type { BootstrapInput } from "@standin/contracts";
import type { BootstrapArgs, CommandContext, CommandOutput } from "../../types";
import { buildBootstrapInput } from "./buildBootstrapInput";
import { buildBootstrapOutput } from "./buildBootstrapOutput";
import { buildDryRunOutput } from "./buildDryRunOutput";
import { resolveEmail } from "./resolveEmail";

export const runBootstrap = async ({
    args,
    env,
    io,
    services,
}: CommandContext<BootstrapArgs>): Promise<CommandOutput> => {
    const email: string = await resolveEmail(args, env, io);
    const input: BootstrapInput = buildBootstrapInput(email, args, env);

    if (args.dryRun) {
        return buildDryRunOutput(parseBootstrapInput(input), input);
    }

    return buildBootstrapOutput(await services.bootstrapInstance(input));
};
