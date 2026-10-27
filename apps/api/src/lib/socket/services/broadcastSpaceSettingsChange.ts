import { SpaceEvents } from "@standin/contracts";
import type { SpaceSettings } from "@standin/contracts";
import { SocketManager } from "../socketManager";
import { buildSpaceRoom } from "../utils/buildSpaceRoom";
import { invalidateSpaceSettings } from "./resolveSpaceSettings";

// The owner saved the settings: the server stops reading the old ones and the
// people inside learn the new ones at once.
export const broadcastSpaceSettingsChange = (
    spaceId: string,
    settings: SpaceSettings
): void => {
    invalidateSpaceSettings(spaceId);
    SocketManager.emitToRoom(
        buildSpaceRoom(spaceId),
        SpaceEvents.SPACE_SETTINGS_CHANGED,
        { settings }
    );
};
