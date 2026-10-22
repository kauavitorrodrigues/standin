import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { INVITE_ERROR_VIEWS, getInviteErrorView } from "../getInviteErrorView";

const failure = (status: number, code?: string) =>
    new AxiosError("failed", String(status), undefined, undefined, {
        status,
        data: code ? { code } : {},
    } as AxiosResponse);

describe("getInviteErrorView", () => {
    it.each([
        ["INVITE_LINK_NOT_FOUND", 404, INVITE_ERROR_VIEWS.NOT_FOUND],
        ["INVITE_LINK_EXPIRED", 410, INVITE_ERROR_VIEWS.EXPIRED],
        ["INVITE_LINK_REVOKED", 410, INVITE_ERROR_VIEWS.REVOKED],
        ["INVITE_LINK_EXHAUSTED", 410, INVITE_ERROR_VIEWS.EXHAUSTED],
        ["GUEST_ACCESS_DISABLED", 403, INVITE_ERROR_VIEWS.DISABLED],
    ])("maps %s", (code, status, expected) => {
        expect(getInviteErrorView(failure(status, code))).toBe(expected);
    });

    it("maps a rate limit by its status", () => {
        expect(getInviteErrorView(failure(429))).toBe(
            INVITE_ERROR_VIEWS.TOO_MANY
        );
    });

    it("falls back for an error with no known code", () => {
        expect(getInviteErrorView(failure(500))).toBe(
            INVITE_ERROR_VIEWS.UNKNOWN
        );
        expect(getInviteErrorView(failure(409, "OTHER"))).toBe(
            INVITE_ERROR_VIEWS.UNKNOWN
        );
    });

    it("falls back for an error that did not come from the API", () => {
        expect(getInviteErrorView(new Error("offline"))).toBe(
            INVITE_ERROR_VIEWS.UNKNOWN
        );
        expect(getInviteErrorView(null)).toBe(INVITE_ERROR_VIEWS.UNKNOWN);
    });
});
