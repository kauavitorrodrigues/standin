import { describe, expect, it } from "vitest";
import { WaveGate } from "../WaveGate";

describe("WaveGate", () => {
    it("lets the first pass of a key through at once", () => {
        const gate = new WaveGate(1000);

        expect(gate.allow("ana", 0)).toBe(true);
    });

    it("drops a second pass of the same key inside the window", () => {
        const gate = new WaveGate(1000);
        gate.allow("ana", 0);

        expect(gate.allow("ana", 999)).toBe(false);
    });

    it("lets the key through again once the window is over", () => {
        const gate = new WaveGate(1000);
        gate.allow("ana", 0);

        expect(gate.allow("ana", 1000)).toBe(true);
    });

    it("does not count a dropped pass, so the window does not slide", () => {
        const gate = new WaveGate(1000);
        gate.allow("ana", 0);
        gate.allow("ana", 900);

        expect(gate.allow("ana", 1000)).toBe(true);
    });

    it("keeps one window per key", () => {
        const gate = new WaveGate(1000);
        gate.allow("ana", 0);

        expect(gate.allow("bia", 10)).toBe(true);
    });

    it("forgets a key that was removed", () => {
        const gate = new WaveGate(1000);
        gate.allow("ana", 0);
        gate.remove("ana");

        expect(gate.allow("ana", 10)).toBe(true);
    });

    it("forgets everything when cleared", () => {
        const gate = new WaveGate(1000);
        gate.allow("ana", 0);
        gate.allow("bia", 0);
        gate.clear();

        expect(gate.allow("ana", 10)).toBe(true);
        expect(gate.allow("bia", 10)).toBe(true);
    });
});
