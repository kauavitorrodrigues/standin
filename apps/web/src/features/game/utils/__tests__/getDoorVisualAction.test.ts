import { describe, expect, it } from "vitest";
import { getDoorVisualAction } from "../getDoorVisualAction";

describe("getDoorVisualAction", () => {
    it("snaps on the first state", () => {
        expect(getDoorVisualAction(undefined, "open")).toBe("snap-open");
        expect(getDoorVisualAction(undefined, "closed")).toBe("snap-closed");
        expect(getDoorVisualAction(undefined, "locked")).toBe("snap-closed");
    });

    it("animates open and closed", () => {
        expect(getDoorVisualAction("closed", "open")).toBe("animate-open");
        expect(getDoorVisualAction("locked", "open")).toBe("animate-open");
        expect(getDoorVisualAction("open", "closed")).toBe("animate-closed");
        expect(getDoorVisualAction("open", "locked")).toBe("animate-closed");
    });

    it("does nothing when the panel does not move", () => {
        expect(getDoorVisualAction("open", "open")).toBe("none");
        expect(getDoorVisualAction("closed", "locked")).toBe("none");
        expect(getDoorVisualAction("locked", "closed")).toBe("none");
    });
});
