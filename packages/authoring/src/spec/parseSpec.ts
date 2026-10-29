import { parseDocument } from "yaml";
import { AUTHORING_ISSUE_CODES, createIssue } from "../issues";
import type { ParseSpecResult } from "../types";

/**
 * Reads the text of a spec. YAML is read, and JSON with it, since JSON is
 * YAML. Only the syntax is checked here, what the value means is up to
 * `validateSpec`. A repeated key in one mapping is a syntax error.
 */
export const parseSpec = (text: string): ParseSpecResult => {
    const document = parseDocument(text, { uniqueKeys: true });
    if (document.errors.length > 0) {
        return {
            ok: false,
            issues: document.errors.map(({ message }) =>
                createIssue(AUTHORING_ISSUE_CODES.SPEC_PARSE_ERROR, "", {
                    reason: message.split("\n")[0] ?? message,
                })
            ),
        };
    }

    return { ok: true, value: document.toJS() as unknown };
};
