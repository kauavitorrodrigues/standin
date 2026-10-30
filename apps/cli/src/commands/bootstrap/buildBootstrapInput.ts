import type { BootstrapInput } from "@standin/contracts";
import { ENV_NAMES } from "../../consts/env";
import type { BootstrapArgs, CliEnv } from "../../types";
import { pickOption } from "../../utils/pickOption";
import { pickSecret } from "../../utils/pickSecret";

export const buildBootstrapInput = (
    email: string,
    args: BootstrapArgs,
    env: CliEnv
): BootstrapInput => {
    const input: BootstrapInput = {
        email,
        password: pickSecret(args.password, env[ENV_NAMES.ADMIN_PASSWORD]),
        name: pickOption(args.name, env[ENV_NAMES.ADMIN_NAME]),
        organizationName: pickOption(
            args.organization,
            env[ENV_NAMES.ORGANIZATION_NAME]
        ),
    };
    return input;
};
