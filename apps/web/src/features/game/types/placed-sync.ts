import type { AssetDefinition, PlacedAsset } from "@standin/contracts";
import type { PlacedRect } from "@/features/game/utils/placed";

// What the sync needs from whatever draws the objects. The scene passes an
// `EditorObjectRenderer`, a test passes a fake.
export type PlacedObjectsView = {
    setAssets: (assets: readonly AssetDefinition[]) => void;
    // With `animate`, an object added or moved plays the drop effect.
    sync: (
        next: readonly PlacedAsset[],
        options?: { animate?: boolean }
    ) => void;
};

// What the sync needs from whatever keeps the solid bodies of the objects.
export type SolidColliderPort = {
    set: (id: string, rects: readonly PlacedRect[]) => void;
    remove: (id: string) => void;
};

// Called after every apply, with the list now on screen and the assets by id,
// so seats, desk hover targets and the like can follow the objects.
export type PlacedObjectsListener = (
    placed: readonly PlacedAsset[],
    assetsById: ReadonlyMap<string, AssetDefinition>
) => void;
