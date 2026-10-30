import type { BootstrapData, BootstrapInput } from "@standin/contracts";
import { MESSAGES } from "../../consts/messages";
import type {
    BootstrapDryRunResult,
    CommandOutput,
    DryRunNoteParams,
} from "../../types";

// The database is not read, so nothing is said about what exists in it.
export const buildDryRunOutput = (
    data: BootstrapData,
    input: BootstrapInput
): CommandOutput => {
    const passwordProvided = Boolean(input.password);

    const result: BootstrapDryRunResult = {
        dryRun: true,
        databaseChecked: false,
        input: {
            email: data.email,
            name: data.name,
            organizationName: data.organizationName,
            passwordProvided,
        },
    };

    const note: DryRunNoteParams = {
        email: data.email,
        organizationName: data.organizationName,
        passwordProvided,
    };

    const lines: string[] = [
        MESSAGES.inputValid,
        MESSAGES.dryRunBootstrapPlan(note),
        MESSAGES.dryRunNoDatabase,
    ];

    return { result, lines };
};
