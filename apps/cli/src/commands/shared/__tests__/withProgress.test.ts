import { describe, expect, it } from "vitest";
import { EXIT_CODES } from "../../../consts/exitCodes";
import { ApiNetworkError } from "../../../errors/ApiNetworkError";
import { StepsFailedError } from "../../../errors/StepsFailedError";
import { toErrorReport } from "../../../errors/toErrorReport";
import { resolveExitCode } from "../../../errors/resolveExitCode";
import type { StepsProgress } from "../../../types";
import { withProgress } from "../withProgress";

const TEMPLATE = { target: "template", name: "library" } as const;

const progress = (): StepsProgress => ({
    done: [{ target: "library", name: "library", action: "seeded" }],
    pending: [TEMPLATE],
});

describe("withProgress", () => {
    it("gives back what the run gives back", async () => {
        await expect(withProgress(progress(), async () => 7)).resolves.toBe(7);
    });

    it("reports a failure that is not the CLI's own as the internal error, with the work done", async () => {
        const error = await withProgress(progress(), async () => {
            throw new TypeError("Cannot read properties of undefined");
        }).catch((caught) => caught);

        expect(error).toBeInstanceOf(StepsFailedError);
        expect(resolveExitCode(error)).toBe(EXIT_CODES.INTERNAL);
        const report = toErrorReport(error);
        expect(report.code).toBe("CLI_INTERNAL");
        expect(report.message).toBe("Unexpected error.");
        expect(report.details?.completed).toEqual([
            { target: "library", name: "library", action: "seeded" },
        ]);
        expect(report.details?.pending).toEqual([TEMPLATE]);
    });

    it("tells a template called library from the library", async () => {
        const state = progress();
        const error = await withProgress(state, async () => {
            throw new TypeError("x");
        }).catch((caught) => caught);

        expect(toErrorReport(error).details?.pending).toEqual([
            { target: "template", name: "library" },
        ]);
    });

    it("names the write that was on its way when the connection fails", async () => {
        const state = progress();
        state.writing = TEMPLATE;
        const error = await withProgress(state, async () => {
            throw new ApiNetworkError("TIMEOUT");
        }).catch((caught) => caught);

        expect(resolveExitCode(error)).toBe(EXIT_CODES.NETWORK);
        const report = toErrorReport(error);
        expect(report.details?.uncertain).toEqual(TEMPLATE);
        expect(report.fix).toContain("may have happened");
    });

    it("does not name a write when none was on its way", async () => {
        const error = await withProgress(progress(), async () => {
            throw new ApiNetworkError("TIMEOUT");
        }).catch((caught) => caught);

        expect(toErrorReport(error).details?.uncertain).toBeUndefined();
    });
});
