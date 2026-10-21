import { describe, expect, it } from "vitest";
import { authSearchSchema } from "../authSearch";

describe("authSearchSchema", () => {
    it("reads the error code", () => {
        expect(
            authSearchSchema.parse({ error: "oauth_state_invalid" })
        ).toEqual({
            error: "oauth_state_invalid",
        });
    });

    it("accepts a plain link with no search", () => {
        expect(authSearchSchema.parse({})).toEqual({});
    });

    it("drops a value of another shape instead of failing", () => {
        expect(authSearchSchema.parse({ error: ["a", "b"] })).toEqual({});
    });
});
