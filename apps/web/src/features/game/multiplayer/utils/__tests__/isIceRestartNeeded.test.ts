import { describe, expect, it } from "vitest";
import { isIceRestartNeeded } from "../isIceRestartNeeded";

describe("isIceRestartNeeded", () => {
    it.each(["disconnected", "failed"] as const)(
        "an open transport that is %s needs it",
        (connectionState) => {
            expect(isIceRestartNeeded({ closed: false, connectionState })).toBe(true);
        }
    );

    it.each(["new", "connecting", "connected", "closed"] as const)(
        "an open transport that is %s does not",
        (connectionState) => {
            expect(isIceRestartNeeded({ closed: false, connectionState })).toBe(false);
        }
    );

    it("a closed transport never does, even if it was failed", () => {
        expect(isIceRestartNeeded({ closed: true, connectionState: "failed" })).toBe(false);
        expect(isIceRestartNeeded({ closed: true, connectionState: "disconnected" })).toBe(false);
    });
});
