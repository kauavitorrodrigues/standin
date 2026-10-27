import { SpaceEvents } from "@standin/contracts";
import type { SpaceSettings } from "@standin/contracts";
import { MediaRuntime, mediaDirty } from "@/lib/media/MediaRuntime";
import { SocketManager } from "../socketManager";
import { buildSpaceRoom } from "../utils/buildSpaceRoom";
import { invalidateSpaceSettings } from "./resolveSpaceSettings";

const updateMediaProximity = (
    spaceId: string,
    settings: SpaceSettings
): void => {
    const room = MediaRuntime.getRoom(spaceId);
    if (!room) return;

    room.setProximityPreset(settings.proximityPreset);
    mediaDirty.markReceivers(spaceId, room.peerIds());
};

// The owner saved the settings: the server stops reading the old ones and the
// people inside learn the new ones at once. The media room of the space, if
// there is one, takes the new reach and plans everybody again on the next tick.
export const broadcastSpaceSettingsChange = (
    spaceId: string,
    settings: SpaceSettings
): void => {
    invalidateSpaceSettings(spaceId);
    updateMediaProximity(spaceId, settings);
    SocketManager.emitToRoom(
        buildSpaceRoom(spaceId),
        SpaceEvents.SPACE_SETTINGS_CHANGED,
        { settings }
    );
};
