import { describe, expect, it } from "vitest";
import { ServiceTokenCreateSchema } from "../schemas";

const future = () => new Date(Date.now() + 86_400_000).toISOString();

describe("ServiceTokenCreateSchema", () => {
    it("accepts a name and scopes without expiry", () => {
        const result = ServiceTokenCreateSchema.safeParse({
            name: "  CI  ",
            scopes: ["maps:write"],
        });

        expect(result.success).toBe(true);
        expect(result.data).toEqual({ name: "CI", scopes: ["maps:write"] });
    });

    it("turns a future expiry into a date", () => {
        const result = ServiceTokenCreateSchema.safeParse({
            name: "CI",
            scopes: ["library:write"],
            expiresAt: future(),
        });

        expect(result.data?.expiresAt).toBeInstanceOf(Date);
    });

    it.each([
        ["no scopes", { name: "CI", scopes: [] }],
        ["an unknown scope", { name: "CI", scopes: ["tokens:admin"] }],
        ["an empty name", { name: " ", scopes: ["maps:write"] }],
        [
            "an expiry in the past",
            {
                name: "CI",
                scopes: ["maps:write"],
                expiresAt: "2020-01-01T00:00:00.000Z",
            },
        ],
        [
            "an expiry that is not a date",
            { name: "CI", scopes: ["maps:write"], expiresAt: "tomorrow" },
        ],
    ])("refuses %s", (_label, body) => {
        expect(ServiceTokenCreateSchema.safeParse(body).success).toBe(false);
    });
});
