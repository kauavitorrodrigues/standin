import { describe, expect, it } from "vitest";
import { parseEmails } from "../email";

describe("parseEmails", () => {
    it("splits by comma, semicolon, space and line break", () => {
        const result = parseEmails("a@x.com,b@x.com; c@x.com d@x.com\ne@x.com");

        expect(result.emails).toEqual([
            "a@x.com",
            "b@x.com",
            "c@x.com",
            "d@x.com",
            "e@x.com",
        ]);
        expect(result.invalid).toEqual([]);
    });

    it("lower cases and drops repeats", () => {
        expect(parseEmails("A@x.com, a@X.com").emails).toEqual(["a@x.com"]);
    });

    it("puts what is not an e-mail apart", () => {
        const result = parseEmails("a@x.com, nope, b@");

        expect(result.emails).toEqual(["a@x.com"]);
        expect(result.invalid).toEqual(["nope", "b@"]);
    });

    it("is empty for empty text", () => {
        expect(parseEmails("  ,; \n")).toEqual({ emails: [], invalid: [] });
    });
});
