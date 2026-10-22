import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAccessMock } = vi.hoisted(() => ({ getAccessMock: vi.fn() }));

vi.mock("@standin/core", () => ({ MapService: { getAccess: getAccessMock } }));

import { MAP_ACCESS_MODES } from "@/consts/mapAccess";
import { RequiresMapAccess } from "../requiresMapAccess";

const buildRes = () => {
    const res = { status: vi.fn(), json: vi.fn(), sendStatus: vi.fn() };
    res.status.mockReturnValue(res);
    res.json.mockReturnValue(res);
    return res;
};

const run = async (mode: keyof typeof MAP_ACCESS_MODES) => {
    const res = buildRes();
    const next = vi.fn();
    await RequiresMapAccess(MAP_ACCESS_MODES[mode])(
        { user: { id: "u1" }, params: { mapId: "m1" } } as never,
        res as never,
        next
    );
    return { res, next };
};

const GUEST_ACCESS = {
    canRead: false,
    canEdit: false,
    canDecorate: false,
    canView: true,
    guest: { id: "g1" },
};

const MEMBER_ACCESS = {
    canRead: true,
    canEdit: false,
    canDecorate: true,
    canView: true,
    guest: null,
};

describe("RequiresMapAccess with guests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it("lets a guest through only the view mode", async () => {
        getAccessMock.mockResolvedValue(GUEST_ACCESS);

        expect((await run("VIEW")).next).toHaveBeenCalled();
    });

    it.each(["READ", "EDIT"] as const)(
        "closes the %s mode to a guest with a 403, the map they view is not hidden",
        async (mode) => {
            getAccessMock.mockResolvedValue(GUEST_ACCESS);

            const { res, next } = await run(mode);

            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
        }
    );

    it("keeps a member in all the modes that do not need the owner", async () => {
        getAccessMock.mockResolvedValue(MEMBER_ACCESS);

        expect((await run("VIEW")).next).toHaveBeenCalled();
        expect((await run("READ")).next).toHaveBeenCalled();
    });

    it("answers 403 to a member who views but cannot edit", async () => {
        getAccessMock.mockResolvedValue(MEMBER_ACCESS);

        const { res, next } = await run("EDIT");

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
    });

    it("closes every mode to a stranger", async () => {
        getAccessMock.mockResolvedValue({
            canRead: false,
            canEdit: false,
            canView: false,
            guest: null,
        });

        for (const mode of ["VIEW", "READ", "EDIT"] as const) {
            const { next, res } = await run(mode);
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(404);
        }
    });
});
