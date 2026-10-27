import { describe, expect, it } from "vitest";
import { diffSpeakers } from "../diffSpeakers";

describe("diffSpeakers", () => {
    it("finds who started and who stopped", () => {
        const result = diffSpeakers(new Set(["a", "b"]), ["b", "c"], "me");
        expect(result.started).toEqual(["c"]);
        expect(result.stopped).toEqual(["a"]);
        expect([...result.next]).toEqual(["b", "c"]);
    });

    it("leaves the local person out", () => {
        const result = diffSpeakers(new Set(), ["me", "a"], "me");
        expect(result.started).toEqual(["a"]);
    });
});
