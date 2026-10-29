import { afterEach, describe, expect, it, vi } from "vitest";
import { formatBuildInfo, logBuildInfo } from "../buildInfo";

describe("formatBuildInfo", () => {
    it("joins the version and the commit", () => {
        expect(
            formatBuildInfo({ version: "1.2.0", commit: "644e6af", commitTime: "" })
        ).toBe("v1.2.0 · 644e6af");
    });

    it("leaves out what the build did not know", () => {
        expect(
            formatBuildInfo({ version: "1.2.0", commit: "", commitTime: "" })
        ).toBe("v1.2.0");
        expect(formatBuildInfo({ version: "", commit: "", commitTime: "" })).toBe(
            "versão desconhecida"
        );
    });
});

describe("logBuildInfo", () => {
    afterEach(() => vi.restoreAllMocks());

    it("prints the build only once", () => {
        const info = vi.spyOn(console, "info").mockImplementation(() => {});
        const build = {
            version: "1.2.0",
            commit: "644e6af",
            commitTime: "2026-10-28T22:22:00-03:00",
        };

        logBuildInfo(build);
        logBuildInfo(build);

        expect(info).toHaveBeenCalledTimes(1);
        expect(info.mock.calls[0][0]).toContain("v1.2.0 · 644e6af");
    });
});
