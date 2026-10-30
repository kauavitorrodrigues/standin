import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { SERVICE_TOKEN_ERROR_MESSAGES as Messages } from "../../consts/messages";
import { getServiceTokenErrorMessage } from "../getServiceTokenErrorMessage";

const apiError = (code: string) =>
    new AxiosError("x", "ERR", undefined, undefined, {
        status: 409,
        data: { code },
    } as AxiosResponse);

describe("getServiceTokenErrorMessage", () => {
    it("explains a token that does not exist anymore", () => {
        expect(
            getServiceTokenErrorMessage(
                apiError("SERVICE_TOKEN_NOT_FOUND"),
                "fallback"
            )
        ).toBe(Messages.NOT_FOUND);
    });

    it("explains a token that is not active", () => {
        expect(
            getServiceTokenErrorMessage(
                apiError("SERVICE_TOKEN_NOT_ACTIVE"),
                "fallback"
            )
        ).toBe(Messages.NOT_ACTIVE);
    });

    it("falls back for anything else", () => {
        expect(getServiceTokenErrorMessage(new Error("boom"), "fallback")).toBe(
            "fallback"
        );
    });
});
