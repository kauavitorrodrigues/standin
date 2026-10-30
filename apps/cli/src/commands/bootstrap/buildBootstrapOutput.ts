import type { BootstrapInstanceResult } from "@standin/core";
import { MESSAGES } from "../../consts/messages";
import type { CommandOutput } from "../../types";

export const buildBootstrapOutput = (
    result: BootstrapInstanceResult
): CommandOutput => {
    const lines: string[] = result.steps.map(({ label }) =>
        MESSAGES.stepLine(label)
    );

    if (result.generatedPassword) {
        lines.push(MESSAGES.generatedPassword(result.generatedPassword));
    }

    return { result, lines };
};
