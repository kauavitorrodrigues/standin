import { afterEach, describe, expect, it } from "vitest";
import { getIdle, handleIdleChange, setIdle } from "../availabilityStore";

describe("handleIdleChange", () => {
    afterEach(() => setIdle(false));

    it("takes the person away when the time without input is up", () => {
        handleIdleChange(true);

        expect(getIdle()).toBe(true);
    });

    it("does not bring the person back on activity", () => {
        handleIdleChange(true);

        handleIdleChange(false);

        expect(getIdle()).toBe(true);
    });

    it("lets the person return by choice", () => {
        handleIdleChange(true);

        setIdle(false);

        expect(getIdle()).toBe(false);
    });
});
