import { describe, expect, it } from "vitest";
import { PLACEMENT_MESSAGES } from "@/features/editor/consts/messages";
import { getDoorHint } from "@/features/editor/utils/getDoorHint";

describe("getDoorHint", () => {
    it("asks for a room first when the map has none", () => {
        expect(getDoorHint(false, false)).toBe(
            PLACEMENT_MESSAGES.DOOR_NEEDS_ROOM
        );
        expect(getDoorHint(false, true)).toBe(
            PLACEMENT_MESSAGES.DOOR_NEEDS_ROOM
        );
    });

    it("says there is no gap when there is a room but no gap near", () => {
        expect(getDoorHint(true, false)).toBe(PLACEMENT_MESSAGES.DOOR_NO_SLOT);
    });

    it("says nothing when the pointer is near a gap", () => {
        expect(getDoorHint(true, true)).toBeNull();
    });
});
