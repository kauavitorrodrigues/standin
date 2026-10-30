import type { CliIo, CommandOutput } from "../types";

// `--json` is one document on stdout; otherwise the lines, one per step.
export const writeSuccess = (
    io: CliIo,
    command: string,
    output: CommandOutput,
    json: boolean
): void => {
    if (json) {
        io.out(
            `${JSON.stringify({ ok: true, command, result: output.result })}\n`
        );
        return;
    }
    for (const line of output.lines) io.out(`${line}\n`);
};
