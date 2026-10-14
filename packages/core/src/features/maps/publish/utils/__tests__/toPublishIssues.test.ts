import { describe, expect, it } from "vitest";
import { toPublishIssues } from "../toPublishIssues";

describe("toPublishIssues", () => {
    it("tags every issue with the op index", () => {
        const issues = toPublishIssues(3, [
            { code: "FOOTPRINT_OVERLAP", path: "ops[3]", message: "overlap" },
        ]);

        expect(issues).toEqual([
            {
                opIndex: 3,
                code: "FOOTPRINT_OVERLAP",
                path: "ops[3]",
                message: "overlap",
            },
        ]);
    });
});
