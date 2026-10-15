import type { AssetDefinition, PlacedAsset } from "@standin/contracts";
import { diffPlaced } from "@/features/game/renderers/diffPlaced";
import type { PlacedDiff } from "@/features/game/types/placed-diff";
import type {
    PlacedObjectsListener,
    PlacedObjectsView,
    SolidColliderPort,
} from "@/features/game/types/placed-sync";
import { resolvePlacedLayout } from "@/features/game/utils/placed";

// Brings the objects of the scene to a new list by applying only the
// difference: sprites through the view, solid bodies through the colliders.
// Layout comes from `resolvePlacedLayout`, the same rule the first draw used,
// so an item on a desk follows the desk when it moves or goes away.
export class PlacedObjectsSync {
    private readonly view: PlacedObjectsView;
    private readonly colliders: SolidColliderPort;
    private readonly mapHeightPx: number;
    private readonly assetsById = new Map<string, AssetDefinition>();
    private readonly listeners: PlacedObjectsListener[] = [];
    private placed: readonly PlacedAsset[] = [];

    constructor(
        view: PlacedObjectsView,
        colliders: SolidColliderPort,
        mapHeightPx: number
    ) {
        this.view = view;
        this.colliders = colliders;
        this.mapHeightPx = mapHeightPx;
    }

    // Runs after every apply, and once now if objects are already drawn.
    subscribe(listener: PlacedObjectsListener): void {
        this.listeners.push(listener);
        if (this.placed.length > 0) listener(this.placed, this.assetsById);
    }

    getPlaced(): readonly PlacedAsset[] {
        return this.placed;
    }

    apply(
        next: readonly PlacedAsset[],
        assets: readonly AssetDefinition[],
        options: { animate?: boolean } = {}
    ): PlacedDiff {
        assets.forEach((asset) => this.assetsById.set(asset.id, asset));
        this.view.setAssets(assets);

        const diff = diffPlaced(this.placed, next);
        this.view.sync(next, options);
        this.syncColliders(diff, next);

        this.placed = next;
        this.listeners.forEach((listener) => listener(next, this.assetsById));
        return diff;
    }

    private syncColliders(
        diff: PlacedDiff,
        next: readonly PlacedAsset[]
    ): void {
        const changed = [...diff.added, ...diff.replaced, ...diff.moved];
        const touched = new Set([
            ...changed.map((item) => item.id),
            ...diff.removed,
        ]);
        const nextById = new Map(next.map((item) => [item.id, item]));

        diff.removed.forEach((id) => this.colliders.remove(id));

        const affected = next.filter(
            (item) =>
                touched.has(item.id) ||
                (item.parentId !== null && touched.has(item.parentId))
        );
        affected.forEach((item) => {
            const layout = resolvePlacedLayout(
                item,
                this.assetsById,
                nextById,
                this.mapHeightPx
            );
            this.colliders.set(item.id, layout?.solidRects ?? []);
        });
    }
}
