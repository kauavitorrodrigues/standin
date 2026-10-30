import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// The login file (or its folder) exists but cannot be read or deleted:
// permissions, or a folder where the file should be.
export class ConfigFileUnreadableError extends CliError {
    constructor(configPath: string, systemCode: string) {
        super(
            `Cannot access the login file ${configPath} (${systemCode}).`,
            "CLI_CONFIG_FILE_UNREADABLE",
            400,
            EXIT_CODES.USAGE,
            {
                path: configPath,
                fix: "Fix the permissions of the file and its folder, or set XDG_CONFIG_HOME to a folder you own.",
            }
        );
    }
}
