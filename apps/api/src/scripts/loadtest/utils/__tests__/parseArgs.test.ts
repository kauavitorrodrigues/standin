import { describe, expect, it } from "vitest";
import { parseLoadTestArgs } from "../parseArgs";

describe("parseLoadTestArgs", () => {
    it("reads positionals and defaults", () => {
        const args = parseLoadTestArgs(["space-1", "10,25,50"]);
        expect(args.spaceId).toBe("space-1");
        expect(args.counts).toEqual([10, 25, 50]);
        expect(args.walkingPercent).toBe(70);
        expect(args.apiPid).toBeNull();
    });

    it("reads the flags", () => {
        const args = parseLoadTestArgs([
            "s",
            "5",
            "--walking",
            "30",
            "--duration",
            "8",
            "--api-pid",
            "99",
        ]);
        expect(args).toMatchObject({
            walkingPercent: 30,
            durationSec: 8,
            apiPid: 99,
        });
    });

    it("rejects a missing space, a bad count and a bad percent", () => {
        expect(() => parseLoadTestArgs([])).toThrow(/Usage/);
        expect(() => parseLoadTestArgs(["s", "x"])).toThrow();
        expect(() => parseLoadTestArgs(["s", "5", "--walking", "150"])).toThrow();
    });
});
