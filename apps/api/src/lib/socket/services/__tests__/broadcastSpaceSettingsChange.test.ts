import { beforeEach, describe, expect, it, vi } from "vitest";

const { emitToRoomMock, invalidateMock, getRoomMock, markReceiversMock } =
    vi.hoisted(() => ({
        emitToRoomMock: vi.fn(),
        invalidateMock: vi.fn(),
        getRoomMock: vi.fn(),
        markReceiversMock: vi.fn(),
    }));

vi.mock("@/lib/media/MediaRuntime", () => ({
    MediaRuntime: { getRoom: getRoomMock },
    mediaDirty: { markReceivers: markReceiversMock },
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
        getRoomMock.mockReturnValue(undefined);
        const settings = {
            enableSendNearbyInMapView: false,
            proximityPreset: "Long" as const,
        };

        broadcastSpaceSettingsChange("space-1", settings);

        expect(invalidateMock).toHaveBeenCalledWith("space-1");
        expect(emitToRoomMock).toHaveBeenCalledWith(
            "space:space-1",
            "space:settings-changed",
            { settings }
        );
    });

    it("gives the media room the new preset and plans everybody again", () => {
        const room = {
            setProximityPreset: vi.fn(),
            peerIds: () => ["a", "b"],
        };
        getRoomMock.mockReturnValue(room);

        broadcastSpaceSettingsChange("space-1", {
            enableSendNearbyInMapView: true,
            proximityPreset: "Short",
        });

        expect(getRoomMock).toHaveBeenCalledWith("space-1");
        expect(room.setProximityPreset).toHaveBeenCalledWith("Short");
        expect(markReceiversMock).toHaveBeenCalledWith("space-1", ["a", "b"]);
    });

    it("leaves the media alone when the space has no room", () => {
        getRoomMock.mockReturnValue(undefined);

        broadcastSpaceSettingsChange("space-1", {
            enableSendNearbyInMapView: true,
            proximityPreset: "Short",
        });

        expect(markReceiversMock).not.toHaveBeenCalled();
    });
});
