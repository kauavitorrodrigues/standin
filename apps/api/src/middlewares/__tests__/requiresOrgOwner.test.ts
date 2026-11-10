import { describe, expect, it, vi } from "vitest";

const { isOwnerMock } = vi.hoisted(() => ({ isOwnerMock: vi.fn() }));

vi.mock("@standin/core", () => ({
    OrganizationService: { isOwner: isOwnerMock },
}));

import { RequiresOrgOwner } from "../requiresOrgOwner";

const buildRes = () => {
    const res = { status: vi.fn(), json: vi.fn() };
    res.status.mockReturnValue(res);
    res.json.mockReturnValue(res);
    return res;
};

const run = (req: Record<string, unknown>) => {
    const res = buildRes();
    const next = vi.fn();
    RequiresOrgOwner(req as never, res as never, next);
    return { res, next };
};

describe("RequiresOrgOwner", () => {
    it("lets the owner through", () => {
        isOwnerMock.mockReturnValue(true);

        const { res, next } = run({ organizationMembership: { id: "m1" } });

        expect(next).toHaveBeenCalledOnce();
        expect(res.status).not.toHaveBeenCalled();
    });

    it("answers 403 to a member who is not the owner", () => {
        isOwnerMock.mockReturnValue(false);

        const { res, next } = run({ organizationMembership: { id: "m1" } });

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
    });

    it("answers 403 when the route found no membership", () => {
        const { res, next } = run({});

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
    });
});
