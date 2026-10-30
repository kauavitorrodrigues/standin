import { parseSpec, validateSpec } from "@standin/authoring";
import type { ParseSpecResult, ValidateSpecResult } from "@standin/authoring";
import type { CheckSpecResult } from "../../../types";

// The text of a spec checked against the spec schema, all local. The issues
// are given back, not thrown, so a caller that reads many specs can list the
// problems of all of them.
export const checkSpecText = (text: string): CheckSpecResult => {
    const parsed: ParseSpecResult = parseSpec(text);
    if (!parsed.ok) return { ok: false, issues: parsed.issues };

    const checked: ValidateSpecResult = validateSpec(parsed.value);
    if (!checked.ok) return { ok: false, issues: checked.issues };
    return { ok: true, spec: checked.spec };
};
