import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { TEMPLATE_MESSAGES } from "../../consts/messages";
import { getDeleteErrorMessage } from "../getDeleteErrorMessage";
import { getDeleteMode } from "../getDeleteMode";

const apiError = (status: number, code: string) =>
    new AxiosError("fail", String(status), undefined, undefined, {
        status,
        data: { error: "x", code },
    } as AxiosResponse);

describe("getDeleteMode", () => {
    it("allows a draft and a retired template", () => {
        expect(getDeleteMode("DRAFT")).toBe("ALLOWED");
        expect(getDeleteMode("RETIRED")).toBe("ALLOWED");
    });

    it("blocks a published template", () => {
        expect(getDeleteMode("PUBLISHED")).toBe("BLOCKED");
    });
});

describe("getDeleteErrorMessage", () => {
    it("explains a template that cannot be deleted (409)", () => {
        expect(
            getDeleteErrorMessage(apiError(409, "TEMPLATE_NOT_DELETABLE"))
        ).toBe(TEMPLATE_MESSAGES.DELETE_PUBLISHED);
    });

    it("warns that the map is locked (423)", () => {
        expect(getDeleteErrorMessage(apiError(423, "MAP_LOCKED"))).toBe(
            TEMPLATE_MESSAGES.DELETE_LOCKED
        );
    });

    it("falls back to the generic message", () => {
        expect(getDeleteErrorMessage(apiError(500, "X"))).toBe(
            TEMPLATE_MESSAGES.DELETE_FAILED
        );
        expect(getDeleteErrorMessage(new Error("boom"))).toBe(
            TEMPLATE_MESSAGES.DELETE_FAILED
        );
    });
});
