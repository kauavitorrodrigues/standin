import { describe, expect, it } from "vitest";
import { MAX_PUBLISH_OPS } from "../../consts/limits";
import { ApplyRequestSchema, ApplyResultSchema } from "../apply.schema";

const op = { type: "set_background", color: "#123456" };
const valid = { baseVersion: 1, ops: [op] };
const uuid = "123e4567-e89b-42d3-a456-426614174000";
const limits = { objectsUsed: 0, objectsMax: 10 };

describe("ApplyRequestSchema", () => {
    it("accepts a request and defaults validateOnly to false", () => {
        const parsed = ApplyRequestSchema.parse(valid);
        expect(parsed.validateOnly).toBe(false);
    });

    it("accepts validateOnly and an empty list of ops", () => {
        expect(
            ApplyRequestSchema.safeParse({ ...valid, validateOnly: true })
                .success
        ).toBe(true);
        expect(
            ApplyRequestSchema.safeParse({ baseVersion: 1, ops: [] }).success
        ).toBe(true);
    });

    it.each([
        ["no base version", { ops: [op] }],
        ["a base version of 0", { ...valid, baseVersion: 0 }],
        ["a fractional base version", { ...valid, baseVersion: 1.5 }],
        ["no ops", { baseVersion: 1 }],
        ["an unknown op", { ...valid, ops: [{ type: "nope" }] }],
        [
            "a validateOnly that is not a boolean",
            { ...valid, validateOnly: "y" },
        ],
    ])("refuses %s", (_label, body) => {
        expect(ApplyRequestSchema.safeParse(body).success).toBe(false);
    });

    it.each([
        ["scope", { scope: "map" }],
        ["publishId", { publishId: uuid }],
    ])("refuses the field %s, which only a publish takes", (_label, extra) => {
        expect(
            ApplyRequestSchema.safeParse({ ...valid, ...extra }).success
        ).toBe(false);
    });

    it("limits the number of ops like a publish", () => {
        const ops = Array.from({ length: MAX_PUBLISH_OPS + 1 }, () => op);
        expect(
            ApplyRequestSchema.safeParse({ baseVersion: 1, ops }).success
        ).toBe(false);
    });
});

describe("ApplyResultSchema", () => {
    it("accepts a publish result and a dry run answer", () => {
        expect(
            ApplyResultSchema.safeParse({ version: 2, idMap: {}, limits })
                .success
        ).toBe(true);
        expect(ApplyResultSchema.safeParse({ valid: true }).success).toBe(true);
    });

    it("refuses anything else", () => {
        expect(ApplyResultSchema.safeParse({ valid: false }).success).toBe(
            false
        );
        expect(ApplyResultSchema.safeParse({}).success).toBe(false);
    });
});
