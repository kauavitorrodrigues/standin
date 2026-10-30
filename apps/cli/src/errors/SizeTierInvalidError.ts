import { FLAGS, SPEC_FIELDS } from "../consts/flags";
import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// --size-tier is not one of the size tiers of the maps.
export class SizeTierInvalidError extends CliError {
    constructor(allowed: string) {
        super(
            `${FLAGS.SIZE_TIER} must be one of ${allowed}.`,
            "CLI_SIZE_TIER_INVALID",
            400,
            EXIT_CODES.USAGE,
            {
                path: FLAGS.SIZE_TIER,
                fix: `Pass one of ${allowed}.`,
            }
        );
    }
}
