import { describe, expect, it } from "vitest";
import { OAUTH_ERROR_CODES } from "@standin/contracts";
import { OAUTH_ERROR_MESSAGES } from "../../consts/messages";
import { getOAuthErrorMessage } from "../getOAuthErrorMessage";

describe("getOAuthErrorMessage", () => {
    it.each([
        [OAUTH_ERROR_CODES.STATE_INVALID, OAUTH_ERROR_MESSAGES.STATE_INVALID],
        [OAUTH_ERROR_CODES.ACCESS_DENIED, OAUTH_ERROR_MESSAGES.ACCESS_DENIED],
        [
            OAUTH_ERROR_CODES.EMAIL_UNVERIFIED,
            OAUTH_ERROR_MESSAGES.EMAIL_UNVERIFIED,
        ],
        [
            OAUTH_ERROR_CODES.EXCHANGE_FAILED,
            OAUTH_ERROR_MESSAGES.EXCHANGE_FAILED,
        ],
        [OAUTH_ERROR_CODES.SIGN_IN_FAILED, OAUTH_ERROR_MESSAGES.FALLBACK],
        ["something-hand-typed", OAUTH_ERROR_MESSAGES.FALLBACK],
    ])("gives the message of %s", (code, message) => {
        expect(getOAuthErrorMessage(code)).toBe(message);
    });

    it("gives a different message to each known failure", () => {
        const messages = [
            OAUTH_ERROR_CODES.STATE_INVALID,
            OAUTH_ERROR_CODES.ACCESS_DENIED,
            OAUTH_ERROR_CODES.EMAIL_UNVERIFIED,
            OAUTH_ERROR_CODES.EXCHANGE_FAILED,
        ].map(getOAuthErrorMessage);

        expect(new Set(messages).size).toBe(4);
    });
});
