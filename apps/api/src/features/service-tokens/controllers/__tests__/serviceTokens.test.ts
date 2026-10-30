import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    ServiceTokenNotActiveError,
    ServiceTokenNotFoundError,
} from "@standin/contracts";

const mocks = vi.hoisted(() => ({
    create: vi.fn(),
    list: vi.fn(),
    regenerate: vi.fn(),
    remove: vi.fn(),
    revoke: vi.fn(),
}));

vi.mock("@standin/core", () => ({ ServiceTokenService: mocks }));

import { createServiceToken } from "../create";
import { listServiceTokens } from "../list";
import { regenerateServiceToken } from "../regenerate";
import { removeServiceToken } from "../remove";
import { revokeServiceToken } from "../revoke";

const buildRes = () => {
    const res: any = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    res.set = vi.fn(() => res);
    return res;
};

beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("createServiceToken controller", () => {
    it("creates for the signed in admin and answers 201 without caching", async () => {
        const created = { token: "sit_x", serviceToken: { id: "t1" } };
        mocks.create.mockResolvedValue(created);
        const res = buildRes();

        await createServiceToken(
            {
                user: { id: "admin-1" },
                body: { name: "CI", scopes: ["maps:write"] },
            } as any,
            res
        );

        expect(mocks.create).toHaveBeenCalledWith("admin-1", {
            name: "CI",
            scopes: ["maps:write"],
        });
        expect(res.set).toHaveBeenCalledWith("Cache-Control", "no-store");
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(created);
    });

    it("answers 400 for a body without scopes", async () => {
        const res = buildRes();

        await createServiceToken(
            { user: { id: "admin-1" }, body: { name: "CI", scopes: [] } } as any,
            res
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mocks.create).not.toHaveBeenCalled();
    });
});

describe("listServiceTokens controller", () => {
    it("answers the list", async () => {
        mocks.list.mockResolvedValue([{ id: "t1" }]);
        const res = buildRes();

        await listServiceTokens({} as any, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ serviceTokens: [{ id: "t1" }] });
    });
});

describe("revokeServiceToken controller", () => {
    it("answers the revoked token", async () => {
        mocks.revoke.mockResolvedValue({ id: "t1" });
        const res = buildRes();

        await revokeServiceToken({ params: { id: "t1" } } as any, res);

        expect(mocks.revoke).toHaveBeenCalledWith("t1");
        expect(res.json).toHaveBeenCalledWith({ serviceToken: { id: "t1" } });
    });

    it("answers 404 for an unknown token", async () => {
        mocks.revoke.mockRejectedValue(new ServiceTokenNotFoundError());
        const res = buildRes();

        await revokeServiceToken({ params: { id: "nope" } } as any, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: "Service token not found.",
            code: "SERVICE_TOKEN_NOT_FOUND",
        });
    });
});

describe("regenerateServiceToken controller", () => {
    it("answers 200 with the new token and no caching", async () => {
        const created = { token: "sit_new", serviceToken: { id: "t1" } };
        mocks.regenerate.mockResolvedValue(created);
        const res = buildRes();

        await regenerateServiceToken({ params: { id: "t1" } } as any, res);

        expect(mocks.regenerate).toHaveBeenCalledWith("t1");
        expect(res.set).toHaveBeenCalledWith("Cache-Control", "no-store");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(created);
    });

    it("answers 404 for an unknown token", async () => {
        mocks.regenerate.mockRejectedValue(new ServiceTokenNotFoundError());
        const res = buildRes();

        await regenerateServiceToken({ params: { id: "nope" } } as any, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it("answers 409 for a token that is not active", async () => {
        mocks.regenerate.mockRejectedValue(new ServiceTokenNotActiveError());
        const res = buildRes();

        await regenerateServiceToken({ params: { id: "t1" } } as any, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            error: "Only an active service token can be regenerated.",
            code: "SERVICE_TOKEN_NOT_ACTIVE",
        });
    });
});

describe("removeServiceToken controller", () => {
    it("answers 204 with no body", async () => {
        mocks.remove.mockResolvedValue(undefined);
        const res: any = buildRes();
        res.send = vi.fn(() => res);

        await removeServiceToken({ params: { id: "t1" } } as any, res);

        expect(mocks.remove).toHaveBeenCalledWith("t1");
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });

    it("answers 404 for an unknown token", async () => {
        mocks.remove.mockRejectedValue(new ServiceTokenNotFoundError());
        const res = buildRes();

        await removeServiceToken({ params: { id: "nope" } } as any, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});
