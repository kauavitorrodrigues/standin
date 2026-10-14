import { describe, expect, it } from "vitest";
import { PUBLISH_PHASE } from "@/features/maps/__shared__/consts/publish-phase";
import { isEditable } from "@/features/maps/__shared__/utils/isEditable";
import { isPanPointer } from "@/features/maps/__shared__/utils/isPanPointer";
import { EDITOR_TOOLS } from "@/features/maps/__shared__/consts/tools";

describe("isEditable", () => {
    it("allows edits when idle and the lock is held", () => {
        expect(isEditable({ publishPhase: PUBLISH_PHASE.IDLE })).toBe(true);
        expect(
            isEditable({ publishPhase: PUBLISH_PHASE.ERROR, locked: false })
        ).toBe(true);
    });

    it("blocks edits while publishing", () => {
        expect(isEditable({ publishPhase: PUBLISH_PHASE.PUBLISHING })).toBe(
            false
        );
    });

    it("blocks edits once the lock is lost", () => {
        expect(
            isEditable({ publishPhase: PUBLISH_PHASE.IDLE, locked: true })
        ).toBe(false);
    });
});

describe("isPanPointer", () => {
    const base = {
        button: 0,
        leftDown: true,
        spaceHeld: false,
        tool: EDITOR_TOOLS.PAINT,
    } as const;

    it("pans with the middle button", () => {
        expect(isPanPointer({ ...base, button: 1, leftDown: false })).toBe(
            true
        );
    });

    it("pans with the left button and space or the pan tool", () => {
        expect(isPanPointer({ ...base, spaceHeld: true })).toBe(true);
        expect(isPanPointer({ ...base, tool: EDITOR_TOOLS.PAN })).toBe(true);
    });

    it("does not pan with a plain left press", () => {
        expect(isPanPointer(base)).toBe(false);
    });
});
