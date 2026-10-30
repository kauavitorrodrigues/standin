#!/usr/bin/env tsx
import { EXIT_CODES } from "./consts/exitCodes";
import { createProcessIo } from "./io/createProcessIo";
import { runCli } from "./program/runCli";
import { createLazyServices } from "./services/createLazyServices";
import type { CliRuntime, ExitCode } from "./types";
import { clearQueryCount } from "./utils/clearQueryCount";

const main = async (): Promise<void> => {
    // Before anything loads the database package.
    clearQueryCount(process.env);
    const runtime: CliRuntime = {
        env: process.env,
        io: createProcessIo(),
        services: createLazyServices(),
    };
    const code: ExitCode = await runCli(process.argv.slice(2), runtime);
    // The database pool keeps the process alive, so it ends here.
    process.exit(code);
};

main().catch(() => process.exit(EXIT_CODES.INTERNAL));
