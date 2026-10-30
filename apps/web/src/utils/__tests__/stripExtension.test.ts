import { describe, expect, it } from "vitest";
import { stripExtension } from "../stripExtension";

describe("stripExtension", () => {
    it("drops the extension", () => {
        expect(stripExtension("airhorn.mp3")).toBe("airhorn");
    });

    it("drops only the last one", () => {
        expect(stripExtension("a.b.mp3")).toBe("a.b");
    });

    it("keeps a name with none", () => {
        expect(stripExtension("airhorn")).toBe("airhorn");
    });
});
