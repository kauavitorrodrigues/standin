import { BootstrapInputInvalidError } from "../errors";
import { BootstrapInputSchema } from "./bootstrap.schema";
import type { BootstrapData, BootstrapInput } from "./bootstrap.schema";

// Checks the input of the first install and gives it with the defaults filled
// in. The error names the field and the rule that broke, never the value.
export const parseBootstrapInput = (input: BootstrapInput): BootstrapData => {
    const parsed = BootstrapInputSchema.safeParse(input);
    if (!parsed.success) {
        const [issue] = parsed.error.issues;
        throw new BootstrapInputInvalidError(
            `${String(issue.path[0] ?? "input")}: ${issue.message}`
        );
    }
    return parsed.data;
};
