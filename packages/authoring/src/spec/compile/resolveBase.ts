import { SIZE_TIERS, buildBlankEditorModel } from "@standin/contracts";
import type { EditorModel } from "@standin/contracts";
import { AUTHORING_ISSUE_CODES, createIssue } from "../../issues";
import type { CompileSpecOptions, Resolved, Spec } from "../../types";

const missing = (kind: string): Resolved<EditorModel> => ({
    ok: false,
    issue: createIssue(AUTHORING_ISSUE_CODES.SPEC_BASE_MISSING, "", { kind }),
});

/**
 * The model the steps start from. A map or a template is built on the model
 * the caller gives, which has to fit the size tier. An area starts blank, with
 * the size it asks for.
 */
export const resolveBase = (
    spec: Spec,
    { base, library }: CompileSpecOptions
): Resolved<EditorModel> => {
    switch (spec.kind) {
        case "area":
            if (!library) return missing(spec.kind);
            return {
                ok: true,
                value: buildBlankEditorModel({ ...spec.size, library }),
            };
        case "map":
        case "template": {
            if (!base) return missing(spec.kind);

            const tier = SIZE_TIERS[spec.sizeTier];
            if (base.width <= tier.maxWidth && base.height <= tier.maxHeight) {
                return { ok: true, value: base };
            }
            return {
                ok: false,
                issue: createIssue(
                    AUTHORING_ISSUE_CODES.SPEC_SIZE_TIER_MISMATCH,
                    "sizeTier",
                    {
                        tier: spec.sizeTier,
                        width: base.width,
                        height: base.height,
                    }
                ),
            };
        }
        default:
            return spec satisfies never;
    }
};
