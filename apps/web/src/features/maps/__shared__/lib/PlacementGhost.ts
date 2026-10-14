import type Phaser from "phaser";
import { TILE_SIZE, type AssetDefinition } from "@standin/contracts";
import { buildAssetTextureKey } from "@/features/game/utils/map";
import { PLACEMENT_GHOST } from "@/features/maps/__shared__/consts/placement-ghost";
import { loadAssetTexture } from "@/features/maps/__shared__/lib/loadAssetTexture";
import type { PlacementGhostTarget } from "@/features/maps/__shared__/types/PlacementGhostTarget";
import type { PlacementGhostView } from "@/features/maps/__shared__/types/PlacementGhostView";

type GhostDisplay =
    | { kind: "sprite"; assetId: string; object: Phaser.GameObjects.Sprite }
    | { kind: "rect"; assetId: string; object: Phaser.GameObjects.Rectangle };

// The translucent copy of the object that follows the cursor while placing.
// It is a sprite of the asset (loaded when first needed) or, until the
// texture arrives, a rectangle of the footprint size. Valid spots keep the
// colors of the asset, invalid ones turn red. It moves on the Phaser side only.
export class PlacementGhost implements PlacementGhostView {
    private readonly scene: Phaser.Scene;
    private readonly loading = new Set<string>();
    private display: GhostDisplay | null = null;
    private last: PlacementGhostTarget | null = null;
    private destroyed = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    show(target: PlacementGhostTarget): void {
        if (this.destroyed) return;
        this.last = target;

        if (this.needsRebuild(target.asset)) this.build(target.asset);
        const display = this.display;
        if (!display) return;

        display.object.setPosition(target.x, target.bottomY);
        display.object.setVisible(true);
        this.paint(display, target.valid);
    }

    hide(): void {
        this.last = null;
        this.display?.object.setVisible(false);
    }

    destroy(): void {
        this.destroyed = true;
        this.last = null;
        this.display?.object.destroy();
        this.display = null;
    }

    // A different asset, or a rectangle whose texture has loaded since.
    private needsRebuild(asset: AssetDefinition): boolean {
        const display = this.display;
        if (!display || display.assetId !== asset.id) return true;
        if (display.kind === "sprite") return false;
        return this.scene.textures.exists(buildAssetTextureKey(asset.id));
    }

    private build(asset: AssetDefinition): void {
        this.display?.object.destroy();

        const key = buildAssetTextureKey(asset.id);
        if (this.scene.textures.exists(key)) {
            const sprite = this.scene.add.sprite(0, 0, key);
            sprite.setOrigin(0, 1);
            sprite.setDepth(PLACEMENT_GHOST.DEPTH);
            this.display = {
                kind: "sprite",
                assetId: asset.id,
                object: sprite,
            };
            return;
        }

        const rect = this.scene.add.rectangle(
            0,
            0,
            asset.footprint.w * TILE_SIZE,
            asset.footprint.h * TILE_SIZE
        );
        rect.setOrigin(0, 1);
        rect.setDepth(PLACEMENT_GHOST.DEPTH);
        this.display = { kind: "rect", assetId: asset.id, object: rect };
        this.requestTexture(asset);
    }

    private paint(display: GhostDisplay, valid: boolean): void {
        if (display.kind === "sprite") {
            if (valid) display.object.clearTint();
            else display.object.setTint(PLACEMENT_GHOST.INVALID_TINT);
            display.object.setAlpha(
                valid
                    ? PLACEMENT_GHOST.VALID_ALPHA
                    : PLACEMENT_GHOST.INVALID_ALPHA
            );
            return;
        }

        const color = valid
            ? PLACEMENT_GHOST.VALID_PLACEHOLDER_COLOR
            : PLACEMENT_GHOST.INVALID_PLACEHOLDER_COLOR;
        display.object.setFillStyle(
            color,
            PLACEMENT_GHOST.PLACEHOLDER_FILL_ALPHA
        );
        display.object.setStrokeStyle(
            PLACEMENT_GHOST.PLACEHOLDER_STROKE_WIDTH,
            color,
            PLACEMENT_GHOST.PLACEHOLDER_STROKE_ALPHA
        );
    }

    // One load per asset. When it arrives, the ghost swaps the rectangle for
    // the sprite if the cursor is still on that asset.
    private requestTexture(asset: AssetDefinition): void {
        if (this.loading.has(asset.id)) return;
        this.loading.add(asset.id);

        void loadAssetTexture(this.scene, asset).then(() => {
            this.loading.delete(asset.id);
            if (this.destroyed) return;

            const target = this.last;
            if (target?.asset.id === asset.id) this.show(target);
        });
    }
}
