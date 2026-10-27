import { beforeEach, describe, expect, it, vi } from "vitest";

const { emitToRoomMock, invalidateMock } = vi.hoisted(() => ({
    emitToRoomMock: vi.fn(),
    invalidateMock: vi.fn(),
}));

vi.mock("../../socketManager", () => ({
    SocketManager: { emitToRoom: emitToRoomMock },
}));

vi.mock("../resolveSpaceSettings", () => ({
    invalidateSpaceSettings: invalidateMock,
}));

import { broadcastSpaceSettingsChange } from "../broadcastSpaceSettingsChange";

describe("broadcastSpaceSettingsChange", () => {
    beforeEach(() => vi.clearAllMocks());

    it("empties the cached settings and tells the room the new ones", () => {
        const settings = { enableSendNearbyInMapView: false };

        broadcastSpaceSettingsChange("space-1", settings);

        expect(invalidateMock).toHaveBeenCalledWith("space-1");
        expect(emitToRoomMock).toHaveBeenCalledWith(
            "space:space-1",
            "space:settings-changed",
            { settings }
        );
    });
});
