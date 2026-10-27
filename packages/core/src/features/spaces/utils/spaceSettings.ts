import { spacesTable } from "@standin/database";
import { SpaceSettingsSchema } from "@standin/contracts";
import type { SpaceSettings } from "@standin/contracts";

// The columns that make up the settings of a space. One entry per setting.
export const spaceSettingsSelect = {
    enableSendNearbyInMapView: spacesTable.enableSendNearbyInMapView,
};

// Parsed again so what leaves the core always has the shape of the contract.
export const toSpaceSettings = (
    row: Record<keyof typeof spaceSettingsSelect, boolean>
): SpaceSettings => SpaceSettingsSchema.parse(row);
