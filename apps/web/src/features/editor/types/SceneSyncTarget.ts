import type {
    AssetDefinition,
    MapLayout,
    PlacedAsset,
    Tileset,
} from "@standin/contracts";

// The part of the editor scene the draft drives. The EditorScene fits it, and
// a test can pass a fake.
export type SceneSyncTarget = {
    syncObjects: (
        placed: readonly PlacedAsset[],
        assets?: readonly AssetDefinition[],
        options?: { animate?: boolean }
    ) => void;
    syncTiles: (
        layout: MapLayout,
        library?: readonly Tileset[]
    ) => Promise<void>;
    setZones: (layout: MapLayout) => void;
    setZonesVisible: (visible: boolean) => void;
};
