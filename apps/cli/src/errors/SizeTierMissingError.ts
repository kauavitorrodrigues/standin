import { FLAGS, SPEC_FIELDS } from "../consts/flags";
import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// A template needs a size tier, and neither --size-tier nor a spec gave one.
export class SizeTierMissingError extends CliError {
    constructor() {
        super(
            `${FLAGS.SIZE_TIER} is required.`,
            "CLI_SIZE_TIER_MISSING",
            400,
            EXIT_CODES.USAGE,
            {
                path: FLAGS.SIZE_TIER,
                fix: `Pass ${FLAGS.SIZE_TIER} <XS|S|M|L|XL>, or ${FLAGS.SPEC} with a sizeTier in it.`,
            }
        );
    }
}
