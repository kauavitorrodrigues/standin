import { UnexpectedFailure } from "../../testing/UnexpectedFailure";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { clearQueryCount } from "../clearQueryCount";
import { formatReadFailure } from "../formatReadFailure";
import { isNetworkError } from "../isNetworkError";
import { redactOptionValue } from "../redactOptionValue";
import { wantsJson } from "../wantsJson";
import { pickOption } from "../pickOption";
import { pickSecret } from "../pickSecret";
import { resolveFolder } from "../resolveFolder";

describe("pickOption", () => {
    it("lets the flag win over the variable", () => {
        expect(pickOption("flag", "env")).toBe("flag");
    });

    it("falls back to the variable when the flag is blank or absent", () => {
        expect(pickOption(undefined, " env ")).toBe("env");
        expect(pickOption("  ", "env")).toBe("env");
    });

    it("is undefined when both are blank", () => {
        expect(pickOption("", " ")).toBeUndefined();
    });
});

describe("pickSecret", () => {
    it("keeps the value as typed and lets the flag win", () => {
        expect(pickSecret(" a ", "env")).toBe(" a ");
        expect(pickSecret("", "env")).toBe("env");
        expect(pickSecret(undefined, "")).toBeUndefined();
    });
});

describe("resolveFolder", () => {
    it("reads a relative folder from where the user typed the command", () => {
        expect(resolveFolder("lib", { INIT_CWD: "/work" })).toBe(
            path.resolve("/work", "lib")
        );
    });

    it("keeps an absolute folder", () => {
        expect(resolveFolder("/abs/lib", { INIT_CWD: "/work" })).toBe(
            "/abs/lib"
        );
    });
});

describe("formatReadFailure", () => {
    it("names the field of a schema issue", () => {
        expect(
            formatReadFailure({
                issues: [{ path: ["tilesets", 0, "key"], message: "Required" }],
            })
        ).toBe("tilesets.0.key: Required");
    });

    it("uses the message of any other error", () => {
        expect(formatReadFailure(new UnexpectedFailure("no such file"))).toBe(
            "no such file"
        );
    });
});

describe("wantsJson", () => {
    it("finds --json before the end of the options only", () => {
        expect(wantsJson(["health", "--json"])).toBe(true);
        expect(wantsJson(["health"])).toBe(false);
        expect(wantsJson(["seed", "library", "--", "--json"])).toBe(false);
    });
});

describe("redactOptionValue", () => {
    it("hides the value after =", () => {
        expect(redactOptionValue("unknown option '--pasword=Secret-1'")).toBe(
            "unknown option '--pasword=<hidden>'"
        );
    });
});

describe("isNetworkError", () => {
    it("finds the code on the error and on its causes", () => {
        const wrapped = new UnexpectedFailure("outer");
        Object.assign(wrapped, {
            cause: new UnexpectedFailure("in", "ETIMEDOUT"),
        });
        expect(isNetworkError(new UnexpectedFailure("x", "ECONNREFUSED"))).toBe(
            true
        );
        expect(isNetworkError(new UnexpectedFailure("x", "ENOTFOUND"))).toBe(
            true
        );
        expect(isNetworkError(wrapped)).toBe(true);
    });

    it("ignores other errors", () => {
        expect(isNetworkError(new UnexpectedFailure("x", "ENOENT"))).toBe(
            false
        );
        expect(isNetworkError(new UnexpectedFailure("x"))).toBe(false);
        expect(isNetworkError(undefined)).toBe(false);
    });
});

describe("clearQueryCount", () => {
    it("removes DB_QUERY_COUNT", () => {
        const env: Record<string, string | undefined> = {
            DB_QUERY_COUNT: "1",
            OTHER: "x",
        };
        clearQueryCount(env);
        expect(env).toEqual({ OTHER: "x" });
    });
});
