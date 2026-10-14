import { describe, expect, it } from "vitest";
import type { EditorOp } from "@standin/contracts";
import { RESUME_DECISION } from "@/features/maps/__shared__/consts/resume-decision";
import { getResumeDecision } from "@/features/maps/__shared__/utils/getResumeDecision";

const ops: EditorOp[] = [{ type: "set_background", color: "#111111" }];

describe("getResumeDecision", () => {
    it("has nothing to offer without a saved draft", () => {
        expect(getResumeDecision(null, 3).kind).toBe(RESUME_DECISION.NONE);
    });

    it("has nothing to offer for a draft with no operations", () => {
        const decision = getResumeDecision({ baseVersion: 3, ops: [] }, 3);

        expect(decision.kind).toBe(RESUME_DECISION.NONE);
    });

    it("offers resuming when the version is the same", () => {
        const stored = { baseVersion: 3, ops };

        expect(getResumeDecision(stored, 3)).toEqual({
            kind: RESUME_DECISION.OFFER,
            draft: stored,
        });
    });

    it("offers only discarding when the map changed", () => {
        const stored = { baseVersion: 2, ops };

        expect(getResumeDecision(stored, 3)).toEqual({
            kind: RESUME_DECISION.STALE,
            draft: stored,
        });
    });
});
