import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// The login file exists but is not what `standin login` writes. Its content is
// not echoed, it holds a token.
export class ConfigFileInvalidError extends CliError {
    constructor(configPath: string) {
        super(
            `The login file ${configPath} is not valid.`,
            "CLI_CONFIG_FILE_INVALID",
            400,
            EXIT_CODES.USAGE,
            {
                path: configPath,
                fix: "Run `pnpm -s standin logout` to delete it, then `pnpm -s standin login` again.",
            }
        );
    }
}
