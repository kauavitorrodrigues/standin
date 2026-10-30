import { MESSAGES } from "../consts/messages";
import type { CliIo, ErrorReport } from "../types";
import { formatIssue } from "../utils/formatIssue";

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
    for (const issue of report.issues ?? []) {
        io.err(`${MESSAGES.issueLine(formatIssue(issue))}\n`);
    }
    for (const [name, value] of Object.entries(report.details ?? {})) {
        io.err(`${MESSAGES.detailLine(name, value)}\n`);
    }
    if (report.fix) io.err(`  fix: ${report.fix}\n`);
};
