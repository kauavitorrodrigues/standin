import { format, parseISO } from "date-fns";
import { describe, expect, it } from "vitest";
import { getLockDeniedDescription } from "@/features/maps/__shared__/utils/getLockDeniedDescription";

const SINCE = "2026-01-01T17:32:00.000Z";
const TIME = format(parseISO(SINCE), "HH:mm");

describe("getLockDeniedDescription", () => {
    it("says who and since when", () => {
        expect(getLockDeniedDescription({ id: "u1", name: "Ana" }, SINCE)).toBe(
            `Em edição por Ana desde ${TIME}`
        );
    });

    it("leaves the time out when it is missing or invalid", () => {
        expect(
            getLockDeniedDescription({ id: "u1", name: "Ana" }, undefined)
        ).toBe("Em edição por Ana");
        expect(
            getLockDeniedDescription({ id: "u1", name: "Ana" }, "nope")
        ).toBe("Em edição por Ana");
    });

    it("falls back when there is no name", () => {
        expect(getLockDeniedDescription(undefined, SINCE)).toBe(
            `Em edição por outra pessoa desde ${TIME}`
        );
    });
});
