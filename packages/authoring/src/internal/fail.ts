import type { AuthoringIssue, BuildResult } from "../types";

export const fail = (...issues: AuthoringIssue[]): BuildResult => ({
    ok: false,
    issues,
});
