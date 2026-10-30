import type { Command } from "commander";
import type { CliRuntime } from "../../types";
import { TOKEN_COMMAND, TOKEN_DESCRIPTION } from "./consts";
import { registerTokenCreate } from "./create/registerTokenCreate";
import { registerTokenList } from "./list/registerTokenList";
import { registerTokenRevoke } from "./revoke/registerTokenRevoke";

export const registerToken = (program: Command, runtime: CliRuntime): void => {
    const token: Command = program
        .command(TOKEN_COMMAND)
        .description(TOKEN_DESCRIPTION);

    registerTokenCreate(token, runtime);
    registerTokenList(token, runtime);
    registerTokenRevoke(token, runtime);
};
