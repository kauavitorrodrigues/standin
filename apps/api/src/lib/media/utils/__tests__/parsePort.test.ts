import { describe, expect, it } from "vitest";
import { parsePort } from "../parsePort";

describe("parsePort", () => {
    it("reads a valid port", () => {
        expect(parsePort("44444", 1)).toBe(44444);
        expect(parsePort("65535", 1)).toBe(65535);
    });

    it("falls back when the text is missing or not a port", () => {
        expect(parsePort(undefined, 7)).toBe(7);
        expect(parsePort("", 7)).toBe(7);
        expect(parsePort("abc", 7)).toBe(7);
        expect(parsePort("0", 7)).toBe(7);
        expect(parsePort("70000", 7)).toBe(7);
        expect(parsePort("1.5", 7)).toBe(7);
    });
});
