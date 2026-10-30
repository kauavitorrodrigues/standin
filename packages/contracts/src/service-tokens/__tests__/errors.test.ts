import { describe, expect, it } from "vitest";
import { BaseError } from "../../errors/base";
import {
    ServiceTokenExpiredError,
    ServiceTokenNotActiveError,
    ServiceTokenNotFoundError,
    ServiceTokenRevokedError,
    ServiceTokenScopeError,
} from "../errors";

describe("service token errors", () => {
    it.each([
        [new ServiceTokenRevokedError(), 401, "SERVICE_TOKEN_REVOKED"],
        [new ServiceTokenExpiredError(), 401, "SERVICE_TOKEN_EXPIRED"],
        [new ServiceTokenScopeError("maps:write"), 403, "SERVICE_TOKEN_SCOPE_MISSING"],
        [new ServiceTokenNotFoundError(), 404, "SERVICE_TOKEN_NOT_FOUND"],
        [new ServiceTokenNotActiveError(), 409, "SERVICE_TOKEN_NOT_ACTIVE"],
    ])("%s has its status and code", (error, status, code) => {
        expect(error).toBeInstanceOf(BaseError);
        expect(error.status).toBe(status);
        expect(error.code).toBe(code);
    });

    it("names the missing scope", () => {
        expect(new ServiceTokenScopeError("maps:write").message).toContain(
            "maps:write"
        );
    });
});
