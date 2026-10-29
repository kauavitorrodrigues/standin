import { describe, expect, it } from "vitest";
import { resolveDeskLockText } from "../resolveDeskLockText";

describe("resolveDeskLockText", () => {
    it("says nothing while the map is free", () => {
        expect(resolveDeskLockText(false, "Ana")).toBeNull();
    });

    it("names the editor who holds the map", () => {
        expect(resolveDeskLockText(true, "Ana")).toBe("Mapa em edição por Ana");
    });

    it("still tells the map is being edited when the name is unknown", () => {
        expect(resolveDeskLockText(true, undefined)).toBe("Mapa em edição");
    });
});
