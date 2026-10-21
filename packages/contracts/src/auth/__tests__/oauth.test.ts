import { describe, expect, it } from "vitest";
import { BaseError } from "../../errors/base";
import { OAUTH_ERROR_CODES } from "../consts/oauth-error-codes";
import { OAUTH_PROVIDERS } from "../enums/oauth-providers";
import {
    OAuthAccessDeniedError,
    OAuthEmailUnverifiedError,
    OAuthExchangeFailedError,
    OAuthProviderDisabledError,
    OAuthStateInvalidError,
} from "../errors";
import { AuthProvidersSchema } from "../schemas/auth-providers.schema";

describe("oauth errors", () => {
    it.each([
        [new OAuthStateInvalidError(), OAUTH_ERROR_CODES.STATE_INVALID, 400],
        [new OAuthAccessDeniedError(), OAUTH_ERROR_CODES.ACCESS_DENIED, 400],
        [
            new OAuthProviderDisabledError(),
            OAUTH_ERROR_CODES.PROVIDER_DISABLED,
            404,
        ],
        [
            new OAuthEmailUnverifiedError(),
            OAUTH_ERROR_CODES.EMAIL_UNVERIFIED,
            422,
        ],
        [
            new OAuthExchangeFailedError(),
            OAUTH_ERROR_CODES.EXCHANGE_FAILED,
            502,
        ],
    ])("%o carries its fixed code and status", (error, code, status) => {
        expect(error).toBeInstanceOf(BaseError);
        expect(error.code).toBe(code);
        expect(error.status).toBe(status);
        expect(error.message).toMatch(/^[A-Z].*\.$/);
    });
});

describe("OAUTH_ERROR_CODES", () => {
    it("has a distinct code for each failure", () => {
        const codes = Object.values(OAUTH_ERROR_CODES);

        expect(new Set(codes).size).toBe(codes.length);
    });
});

describe("OAUTH_PROVIDERS", () => {
    it("starts with github", () => {
        expect(Object.values(OAUTH_PROVIDERS)).toEqual(["github"]);
    });
});

describe("AuthProvidersSchema", () => {
    it("takes the answer of the providers route", () => {
        expect(AuthProvidersSchema.parse({ github: true })).toEqual({
            github: true,
        });
    });

    it("refuses a missing flag", () => {
        expect(AuthProvidersSchema.safeParse({}).success).toBe(false);
    });
});
