import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// An area spec builds a library area, not the layout of a map.
export class SpecKindUnsupportedError extends CliError {
    constructor(kind: string) {
        super(
            `A spec of kind "${kind}" cannot be applied to a map.`,
            "CLI_SPEC_KIND_UNSUPPORTED",
            422,
            EXIT_CODES.VALIDATION,
            {
                path: "kind",
                fix: 'Use a spec with kind "map" or "template" for --map.',
            }
        );
    }
}
