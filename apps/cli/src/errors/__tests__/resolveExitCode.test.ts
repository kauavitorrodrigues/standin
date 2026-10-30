import { UnexpectedFailure } from "../../testing/UnexpectedFailure";
import { BaseError, LibrarySeedAdminNotFoundError } from "@standin/contracts";
import { describe, expect, it } from "vitest";
import { EXIT_CODES } from "../../consts/exitCodes";
import { InstanceDownError } from "../InstanceDownError";
import { LibraryFolderInvalidError } from "../LibraryFolderInvalidError";
import { MissingOptionError } from "../MissingOptionError";
import { UsageError } from "../UsageError";
import { resolveExitCode } from "../resolveExitCode";
import { toErrorReport } from "../toErrorReport";

class FakeDomainError extends BaseError {
    constructor(status: number) {
        super("domain failure", "FAKE_DOMAIN", status);
    }
}

describe("resolveExitCode", () => {
    it("uses the code each CLI error declares", () => {
        expect(resolveExitCode(new UsageError("x"))).toBe(EXIT_CODES.USAGE);
        expect(resolveExitCode(new MissingOptionError("--a", "A"))).toBe(
            EXIT_CODES.USAGE
        );
        expect(resolveExitCode(new LibraryFolderInvalidError("f", "d"))).toBe(
            EXIT_CODES.VALIDATION
        );
        expect(resolveExitCode(new InstanceDownError(5))).toBe(
            EXIT_CODES.NETWORK
        );
    });

    it.each([
        [400, EXIT_CODES.VALIDATION],
        [422, EXIT_CODES.VALIDATION],
        [401, EXIT_CODES.AUTH],
        [403, EXIT_CODES.AUTH],
        [409, EXIT_CODES.CONFLICT],
        [423, EXIT_CODES.CONFLICT],
        [404, EXIT_CODES.INTERNAL],
        [500, EXIT_CODES.INTERNAL],
    ])("maps the status %i of a domain error to %i", (status, expected) => {
        expect(resolveExitCode(new FakeDomainError(status))).toBe(expected);
    });

    it("treats a missing admin as a conflict, whatever its status", () => {
        expect(resolveExitCode(new LibrarySeedAdminNotFoundError())).toBe(
            EXIT_CODES.CONFLICT
        );
    });

    it("treats anything else as internal", () => {
        expect(resolveExitCode(new UnexpectedFailure("boom"))).toBe(
            EXIT_CODES.INTERNAL
        );
        expect(resolveExitCode("text")).toBe(EXIT_CODES.INTERNAL);
    });
});

describe("toErrorReport", () => {
    it("carries the path and the fix of a CLI error", () => {
        expect(
            toErrorReport(new MissingOptionError("--email", "ADMIN_EMAIL"))
        ).toEqual({
            code: "CLI_MISSING_OPTION",
            message: "--email is required.",
            path: "--email",
            fix: "Pass --email <value> or set ADMIN_EMAIL.",
        });
    });

    it("reports a domain error by its code and message", () => {
        expect(toErrorReport(new FakeDomainError(409))).toEqual({
            code: "FAKE_DOMAIN",
            message: "domain failure",
        });
    });

    it("adds the fix of a domain error that has one", () => {
        expect(
            toErrorReport(new LibrarySeedAdminNotFoundError()).fix
        ).toContain("standin bootstrap");
    });

    it("reports an unexpected error without its own message", () => {
        expect(toErrorReport(new UnexpectedFailure("boom"))).toEqual({
            code: "CLI_INTERNAL",
            message: "Unexpected error.",
        });
    });

    it("shows the cause of a query error but never its parameters", () => {
        const query = new UnexpectedFailure(
            "Failed query: select * from users where email = $1\nparams: boss@example.com,hash"
        );
        Object.assign(query, {
            cause: new UnexpectedFailure(
                "relation users does not exist\nparams: boss@example.com"
            ),
        });
        const { message } = toErrorReport(query);
        expect(message).toBe("Unexpected error. relation users does not exist");
        expect(message).not.toContain("boss@example.com");
    });
});
