import { afterEach, describe, expect, it, vi } from "vitest";
import { setTokenCookie } from "../setTokenCookie";

describe("setTokenCookie", () => {
    afterEach(() => vi.unstubAllEnvs());

    it("sets the httpOnly lax cookie for seven days", () => {
        vi.stubEnv("NODE_ENV", "development");
        const res = { cookie: vi.fn() };

        setTokenCookie(res as never, "jwt");

        expect(res.cookie).toHaveBeenCalledWith("token", "jwt", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    });

    it("is secure in production", () => {
        vi.stubEnv("NODE_ENV", "production");
        const res = { cookie: vi.fn() };

        setTokenCookie(res as never, "jwt");

        expect(res.cookie).toHaveBeenCalledWith(
            "token",
            "jwt",
            expect.objectContaining({ secure: true })
        );
    });
});
