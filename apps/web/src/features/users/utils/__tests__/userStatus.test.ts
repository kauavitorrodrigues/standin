import { describe, expect, it } from "vitest";
import { isBusyStatus, statusOfBusy } from "../userStatus";

describe("user status", () => {
    it("is busy when the person asked not to be disturbed", () => {
        expect(statusOfBusy(true)).toBe("busy");
        expect(statusOfBusy(false)).toBe("active");
    });

    it("tells whether a status asks not to be disturbed", () => {
        expect(isBusyStatus("busy")).toBe(true);
        expect(isBusyStatus("active")).toBe(false);
    });
});
