import { describe, expect, it } from "vitest";
import { getRoomLockButton } from "../roomLock";

describe("getRoomLockButton", () => {
    it("offers to lock an open or closed room", () => {
        expect(getRoomLockButton("open").action).toBe("lock");
        expect(getRoomLockButton("closed").action).toBe("lock");
    });

    it("offers to unlock a locked room", () => {
        const button = getRoomLockButton("locked");
        expect(button.action).toBe("unlock");
        expect(button.label).toBe("Destrancar sala");
    });
});
