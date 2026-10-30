import type { Command } from "commander";
import { REMOTE_OPTIONS_HELP } from "./consts";

// The flags every remote command takes to find the instance. Each one falls
// back to its variable and then to the file of `standin login`.
export const addRemoteOptions = (command: Command): Command =>
    command
        .option("--url <url>", "address of the instance (STANDIN_URL)")
        .option(
            "--token <token>",
            "service token (STANDIN_TOKEN, prefer the variable: a flag stays in the shell history)"
        )
        .addHelpText("after", REMOTE_OPTIONS_HELP);
