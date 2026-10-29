import { describe, expect, it } from "vitest";
import { getLoadFailureKind } from "@/utils/getLoadFailureKind";

describe("getLoadFailureKind", () => {
    it("blames the connection when the browser is offline", () => {
        expect(getLoadFailureKind(false)).toBe("offline");
    });

    it("says the download failed when the browser is online", () => {
        expect(getLoadFailureKind(true)).toBe("failed");
    });
});
