import { describe, expect, it } from "vitest";
import { acquireGameInputLock, isGameInputLocked } from "../inputLock";

describe("game input lock", () => {
    it("blocks the game while held and frees it on release", () => {
        expect(isGameInputLocked()).toBe(false);

        const release = acquireGameInputLock();
        expect(isGameInputLocked()).toBe(true);

        release();
        expect(isGameInputLocked()).toBe(false);
    });

    it("stays blocked until every holder has released", () => {
        const first = acquireGameInputLock();
        const second = acquireGameInputLock();

        first();
        expect(isGameInputLocked()).toBe(true);

        second();
        expect(isGameInputLocked()).toBe(false);
    });

    it("ignores a second release from the same holder", () => {
        const first = acquireGameInputLock();
        const second = acquireGameInputLock();

        first();
        first();
        expect(isGameInputLocked()).toBe(true);

        second();
        expect(isGameInputLocked()).toBe(false);
    });
});
