import type { CliIo, ErrorReport } from "../types";

// `--json` keeps the error on stdout so a caller parses one stream; people
// read it on stderr.
export const writeFailure = (
    io: CliIo,
    report: ErrorReport,
    json: boolean
): void => {
    if (json) {
        io.out(`${JSON.stringify({ ok: false, error: report })}\n`);
        return;
    }
    io.err(`error [${report.code}]: ${report.message}\n`);
    if (report.fix) io.err(`  fix: ${report.fix}\n`);
};
