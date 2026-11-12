import { describe, expect, it } from "vitest";
import { BrowserLoadTestUsageError } from "../../errors";
import { parseBrowserLoadArgs } from "../parseArgs";

describe("parseBrowserLoadArgs", () => {
    it("reads the space, the sizes and the defaults", () => {
        const args = parseBrowserLoadArgs(["space-1", "4,9"]);
        expect(args.spaceId).toBe("space-1");
        expect(args.counts).toEqual([4, 9]);
        expect(args.runs).toBe(5);
    });

    it("reads the options", () => {
        const args = parseBrowserLoadArgs([
            "space-1",
            "2",
            "--runs",
            "1",
            "--duration",
            "10",
            "--web-url",
            "http://localhost:4000",
        ]);
        expect(args.runs).toBe(1);
        expect(args.durationSec).toBe(10);
        expect(args.webUrl).toBe("http://localhost:4000");
    });

    it("rejects a missing size and a bad number", () => {
        expect(() => parseBrowserLoadArgs(["space-1"])).toThrow(
            BrowserLoadTestUsageError
        );
        expect(() => parseBrowserLoadArgs(["space-1", "0"])).toThrow(
            BrowserLoadTestUsageError
        );
    });
});
