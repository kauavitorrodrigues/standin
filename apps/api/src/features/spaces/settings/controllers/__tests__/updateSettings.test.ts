import { beforeEach, describe, expect, it, vi } from "vitest";

const { updateMock, broadcastMock } = vi.hoisted(() => ({
    updateMock: vi.fn(),
    broadcastMock: vi.fn(),
}));

vi.mock("@/lib/socket/services/broadcastSpaceSettingsChange", () => ({
    broadcastSpaceSettingsChange: broadcastMock,
}));

vi.mock("@standin/core", () => ({
    SpaceService: { updateSettings: updateMock },
}));

import { updateSettings } from "../updateSettings";

const buildRes = () => {
    const res: any = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

const spaceRef = { id: "s1", mapId: "m1", organizationId: "org-1" };

describe("updateSettings controller", () => {
    beforeEach(() => vi.clearAllMocks());

    it("hands the partial save to the core and answers the settings", async () => {
        updateMock.mockResolvedValue({ enableSendNearbyInMapView: false });
        const res = buildRes();

        await updateSettings(
            { spaceRef, body: { enableSendNearbyInMapView: false } } as any,
            res
        );

        expect(updateMock).toHaveBeenCalledWith("org-1", "s1", {
            enableSendNearbyInMapView: false,
        });
        expect(broadcastMock).toHaveBeenCalledWith("s1", {
            enableSendNearbyInMapView: false,
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            settings: { enableSendNearbyInMapView: false },
        });
    });

    it("rejects a key that is not a setting without saving", async () => {
        const res = buildRes();

        await updateSettings({ spaceRef, body: { roles: true } } as any, res);

        expect(updateMock).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });
});
