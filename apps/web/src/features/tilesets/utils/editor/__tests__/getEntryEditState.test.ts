import { describe, expect, it } from "vitest";
import { TILE_ENTRY_EDIT_STATES } from "../../../consts/entryEditStates";
import { getTileEntryEditState } from "../getEntryEditState";

const saved = { "3": { category: "FLOOR" } } as const;

describe("getTileEntryEditState", () => {
    it("locks a saved entry of an image in use", () => {
        expect(getTileEntryEditState(true, saved, 3)).toBe(
            TILE_ENTRY_EDIT_STATES.BLANK_DEFAULT_ONLY
        );
    });

    it("frees a new entry of an image in use", () => {
        expect(getTileEntryEditState(true, saved, 4)).toBe(
            TILE_ENTRY_EDIT_STATES.FULL
        );
    });

    it("frees every entry of an image not in use", () => {
        expect(getTileEntryEditState(false, saved, 3)).toBe(
            TILE_ENTRY_EDIT_STATES.FULL
        );
    });
});
