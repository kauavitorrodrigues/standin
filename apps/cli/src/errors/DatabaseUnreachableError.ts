import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// The database refused or did not answer the connection.
export class DatabaseUnreachableError extends CliError {
    constructor(networkCode: string) {
        super(
            `Cannot reach the database (${networkCode}).`,
            "CLI_DATABASE_UNREACHABLE",
            503,
            EXIT_CODES.NETWORK,
            {
                fix: "Check that the database is running and that DATABASE_URL points to it.",
            }
        );
    }
}
