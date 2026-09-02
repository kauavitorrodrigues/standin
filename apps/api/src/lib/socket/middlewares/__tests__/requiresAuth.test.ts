import { beforeEach, describe, expect, it, vi } from "vitest";

const { authenticateFromTokenMock } = vi.hoisted(() => ({
    authenticateFromTokenMock: vi.fn(),
}));

vi.mock("@/features/auth/services/authenticateFromToken", () => ({
    authenticateFromToken: authenticateFromTokenMock,
}));

import { requiresSocketAuth } from "../requiresAuth";

function buildSocket(cookie?: string, authToken?: string) {
    return {
        handshake: { auth: { token: authToken }, headers: { cookie } },
        data: {} as Record<string, unknown>,
    };
}

describe("requiresSocketAuth", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("authenticates handshakes using the auth token and populates socket.data", async () => {
        authenticateFromTokenMock.mockResolvedValue({ id: "user-1" });

        const socket = buildSocket(undefined, "valid-token");
        const next = vi.fn();

        await requiresSocketAuth(socket as any, next);

        expect(authenticateFromTokenMock).toHaveBeenCalledWith("valid-token");
        expect(socket.data.userId).toBe("user-1");
        expect(socket.data.spaceId).toBeNull();
        expect(next).toHaveBeenCalledWith();
    });

    it("falls back to the cookie token when no auth token is provided", async () => {
        authenticateFromTokenMock.mockResolvedValue({ id: "user-1" });

        const socket = buildSocket("token=cookie-token");
        const next = vi.fn();

        await requiresSocketAuth(socket as any, next);

        expect(authenticateFromTokenMock).toHaveBeenCalledWith("cookie-token");
        expect(next).toHaveBeenCalledWith();
    });

    it("rejects the handshake with an error when no token is present", async () => {
        const socket = buildSocket(undefined);
        const next = vi.fn();

        await requiresSocketAuth(socket as any, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(authenticateFromTokenMock).not.toHaveBeenCalled();
    });

    it("rejects the handshake with an error when authentication fails", async () => {
        authenticateFromTokenMock.mockResolvedValue(false);

        const socket = buildSocket(undefined, "invalid-token");
        const next = vi.fn();

        await requiresSocketAuth(socket as any, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("rejects the handshake with an error when an unexpected error is thrown", async () => {
        authenticateFromTokenMock.mockImplementation(() => {
            throw new Error("boom");
        });

        const socket = buildSocket(undefined, "valid-token");
        const next = vi.fn();

        await requiresSocketAuth(socket as any, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});
