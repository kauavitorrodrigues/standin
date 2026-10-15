import { describe, expect, it } from "vitest";
import { isRoomArea } from "../isRoomArea";

describe("isRoomArea", () => {
    it("is a room only with a zone of kind private", () => {
        expect(isRoomArea({ createZone: true, zoneKind: "private" })).toBe(
            true
        );
        expect(isRoomArea({ createZone: true, zoneKind: "area" })).toBe(false);
        expect(isRoomArea({ createZone: false, zoneKind: "private" })).toBe(
            false
        );
    });
});
