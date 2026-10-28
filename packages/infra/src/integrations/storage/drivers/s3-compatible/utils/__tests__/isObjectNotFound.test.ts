import { describe, expect, it } from "vitest";
import { isObjectNotFound } from "../isObjectNotFound";

describe("isObjectNotFound", () => {
    it("recognizes the names and the 404 status", () => {
        expect(
            isObjectNotFound(Object.assign(new Error(), { name: "NoSuchKey" }))
        ).toBe(true);
        expect(
            isObjectNotFound(Object.assign(new Error(), { name: "NotFound" }))
        ).toBe(true);
        expect(
            isObjectNotFound(
                Object.assign(new Error(), {
                    $metadata: { httpStatusCode: 404 },
                })
            )
        ).toBe(true);
    });

    it("ignores other failures", () => {
        expect(isObjectNotFound(new Error("boom"))).toBe(false);
        expect(isObjectNotFound("NoSuchKey")).toBe(false);
    });
});
