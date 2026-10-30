import { ENV_NAMES } from "../../consts/env";
import { MESSAGES } from "../../consts/messages";
import { MissingOptionError } from "../../errors/MissingOptionError";
import { askMissing } from "../../io/askMissing";
import type { BootstrapArgs, CliEnv, CliIo, GlobalFlags } from "../../types";
import { pickOption } from "../../utils/pickOption";

// The flag, then the variable, then (on a terminal only) the prompt.
export const resolveEmail = async (
    args: BootstrapArgs & GlobalFlags,
    env: CliEnv,
    io: CliIo
): Promise<string> => {
    const given = pickOption(args.email, env[ENV_NAMES.ADMIN_EMAIL]);
    if (given) return given;

    const asked = await askMissing(io, args, MESSAGES.adminEmailQuestion);
    if (asked) return asked;

    throw new MissingOptionError("--email", ENV_NAMES.ADMIN_EMAIL);
};
