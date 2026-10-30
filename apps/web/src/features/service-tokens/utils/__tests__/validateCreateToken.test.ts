import { SERVICE_TOKEN_NAME_MAX_LENGTH } from "@standin/contracts";
import { describe, expect, it } from "vitest";
import { SERVICE_TOKEN_VALIDATION_MESSAGES as Messages } from "../../consts/messages";
import { validateCreateToken } from "../validateCreateToken";

const valid = {
    name: "  importer ",
    scopes: ["library:write" as const],
    expiry: "never" as const,
    expiresOn: "",
};

describe("validateCreateToken", () => {
    it("builds the payload with the name trimmed and no expiry", () => {
        expect(validateCreateToken(valid)).toEqual({
            ok: true,
            payload: { name: "importer", scopes: ["library:write"] },
        });
    });

    it("requires a name", () => {
        const result = validateCreateToken({ ...valid, name: "   " });
        expect(result).toEqual({
            ok: false,
            errors: { name: Messages.NAME_REQUIRED },
        });
    });

    it("limits the name", () => {
        const name = "a".repeat(SERVICE_TOKEN_NAME_MAX_LENGTH + 1);
        expect(validateCreateToken({ ...valid, name })).toEqual({
            ok: false,
            errors: { name: Messages.NAME_TOO_LONG },
        });
    });

    it("requires at least one scope", () => {
        expect(validateCreateToken({ ...valid, scopes: [] })).toEqual({
            ok: false,
            errors: { scopes: Messages.SCOPES_REQUIRED },
        });
    });

    it("sends the end of the chosen day as the expiry", () => {
        const next = new Date().getFullYear() + 1;
        const result = validateCreateToken({
            ...valid,
            expiry: "custom",
            expiresOn: `${next}-06-15`,
        });
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.payload.expiresAt).toBe(
            new Date(`${next}-06-15T23:59:59`).toISOString()
        );
    });

    it("refuses an expiry in the past", () => {
        expect(
            validateCreateToken({
                ...valid,
                expiry: "custom",
                expiresOn: "2020-01-01",
            })
        ).toEqual({ ok: false, errors: { expiresOn: Messages.EXPIRY_PAST } });
    });

    it("reports every field with a problem", () => {
        const result = validateCreateToken({
            name: "",
            scopes: [],
            expiry: "custom",
            expiresOn: "2020-01-01",
        });
        expect(result).toEqual({
            ok: false,
            errors: {
                name: Messages.NAME_REQUIRED,
                scopes: Messages.SCOPES_REQUIRED,
                expiresOn: Messages.EXPIRY_PAST,
            },
        });
    });

    it("turns a quick option into the end of that day", () => {
        const now = new Date(2026, 9, 30, 10);
        const result = validateCreateToken({ ...valid, expiry: "30d" }, now);
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.payload.expiresAt).toBe(
            new Date(2026, 10, 29, 23, 59, 59).toISOString()
        );
    });

    it("asks for the date when the specific date is empty", () => {
        expect(validateCreateToken({ ...valid, expiry: "custom" })).toEqual({
            ok: false,
            errors: { expiresOn: Messages.EXPIRY_INVALID },
        });
    });
});
