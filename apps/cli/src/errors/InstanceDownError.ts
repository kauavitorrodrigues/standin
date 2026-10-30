import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// The health check found a dependency that does not answer.
export class InstanceDownError extends CliError {
    constructor(responseTimeMs: number) {
        super(
            `The instance is down (checked in ${responseTimeMs} ms).`,
            "CLI_INSTANCE_DOWN",
            503,
            EXIT_CODES.NETWORK,
            {
                fix: "Check that the database is running and that DATABASE_URL is right.",
            }
        );
    }
}
