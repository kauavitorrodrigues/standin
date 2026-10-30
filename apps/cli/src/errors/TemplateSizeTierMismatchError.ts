import { FLAGS, SPEC_FIELDS } from "../consts/flags";
import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// The size tier of the spec is not the one of --size-tier.
export class TemplateSizeTierMismatchError extends CliError {
    constructor(specTier: string, optionTier: string) {
        super(
            `The spec has sizeTier ${specTier} but ${FLAGS.SIZE_TIER} is ${optionTier}.`,
            "CLI_TEMPLATE_SIZE_TIER_MISMATCH",
            422,
            EXIT_CODES.VALIDATION,
            {
                path: SPEC_FIELDS.SIZE_TIER,
                fix: `Make them the same, or leave ${FLAGS.SIZE_TIER} out to take it from the spec.`,
            }
        );
    }
}
