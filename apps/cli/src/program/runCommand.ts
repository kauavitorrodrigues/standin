import { writeSuccess } from "../io/writeSuccess";
import type {
    CliRuntime,
    CommandContext,
    CommandOutput,
    GlobalFlags,
} from "../types";

// Runs one command with the real or fake runtime and prints what it returns.
// An error goes up to runCli, which owns the exit code.
export const runCommand = async <Args>(
    name: string,
    args: Args & GlobalFlags,
    runtime: CliRuntime,
    run: (context: CommandContext<Args>) => Promise<CommandOutput>
): Promise<void> => {
    const output = await run({ args, ...runtime });
    writeSuccess(runtime.io, name, output, Boolean(args.json));
};
