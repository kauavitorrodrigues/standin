import type Phaser from "phaser";
import {
    SOLID_MASK_SUBDIVISION,
    TILE_SIZE,
    type AssetDefinition,
} from "@standin/contracts";
import { buildAssetTextureKey } from "@/features/game/utils/map";
import { PLACEMENT_GHOST } from "@/features/editor/consts/placement-ghost";
import { loadAssetTexture } from "@/features/editor/lib/loadAssetTexture";
import type { PlacementGhostTarget } from "@/features/editor/types/PlacementGhostTarget";
import type { PlacementGhostView } from "@/features/editor/types/PlacementGhostView";

type GhostDisplay =
    | { kind: "sprite"; assetId: string; object: Phaser.GameObjects.Sprite }
    | { kind: "rect"; assetId: string; object: Phaser.GameObjects.Rectangle };

// The translucent copy of the object that follows the cursor while placing.
// It is a sprite of the asset (loaded when first needed) or, until the
// texture arrives, a rectangle of the footprint size. Valid spots keep the
// colors of the asset, invalid ones turn red. An asset whose footprint has a
// mask also gets a tint over the tiles it occupies, so the free tiles show.
// It moves on the Phaser side only.
export class PlacementGhost implements PlacementGhostView {
    private readonly scene: Phaser.Scene;
    private readonly loading = new Set<string>();
    private display: GhostDisplay | null = null;
    private cells: Phaser.GameObjects.Graphics | null = null;
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
        this.paint(display, target.valid, target.warning === true);
        this.paintOccupiedCells(target);
    }

    hide(): void {
        this.last = null;
        this.display?.object.setVisible(false);
        this.cells?.setVisible(false);
    }

    destroy(): void {
        this.destroyed = true;
        this.last = null;
        this.display?.object.destroy();
        this.display = null;
        this.cells?.destroy();
        this.cells = null;
    }

    // The cells the object occupies, over the sprite. The footprint starts
    // `offsetX` tiles to the right of the left edge of the sprite and ends at
    // its base. Without a mask there is nothing to show, the sprite says it.
    private paintOccupiedCells(target: PlacementGhostTarget): void {
        const { mask, w, h, offsetX } = target.asset.footprint;
        if (!mask) {
            this.cells?.setVisible(false);
            return;
        }

        const cells =
            this.cells ??
            this.scene.add.graphics().setDepth(PLACEMENT_GHOST.DEPTH + 0.5);
        this.cells = cells;

        const color = this.getPlaceholderColor(
            target.valid,
            target.warning === true
        );
        const left = target.x + offsetX * TILE_SIZE;
        cells.clear();
        cells.fillStyle(color, PLACEMENT_GHOST.PLACEHOLDER_FILL_ALPHA);
        const cellPx = TILE_SIZE / SOLID_MASK_SUBDIVISION;
        mask.forEach((row, rowIndex) => {
            row.forEach((occupied, column) => {
                if (!occupied || column >= w * SOLID_MASK_SUBDIVISION) return;
                cells.fillRect(
                    left + column * cellPx,
                    target.bottomY - h * TILE_SIZE + rowIndex * cellPx,
                    cellPx,
                    cellPx
                );
            });
        });
        cells.setVisible(true);
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

    private getPlaceholderColor(valid: boolean, warning: boolean): number {
        if (!valid) return PLACEMENT_GHOST.INVALID_PLACEHOLDER_COLOR;
        if (warning) return PLACEMENT_GHOST.WARNING_PLACEHOLDER_COLOR;
        return PLACEMENT_GHOST.VALID_PLACEHOLDER_COLOR;
    }

    private paintSprite(
        sprite: Phaser.GameObjects.Sprite,
        valid: boolean,
        warning: boolean
    ): void {
        if (!valid) {
            sprite.setTint(PLACEMENT_GHOST.INVALID_TINT);
            sprite.setAlpha(PLACEMENT_GHOST.INVALID_ALPHA);
            return;
        }
        if (warning) {
            sprite.setTint(PLACEMENT_GHOST.WARNING_TINT);
            sprite.setAlpha(PLACEMENT_GHOST.WARNING_ALPHA);
            return;
        }
        sprite.clearTint();
        sprite.setAlpha(PLACEMENT_GHOST.VALID_ALPHA);
    }

    private paint(
        display: GhostDisplay,
        valid: boolean,
        warning: boolean
    ): void {
        if (display.kind === "sprite") {
            this.paintSprite(display.object, valid, warning);
            return;
        }

        const color = this.getPlaceholderColor(valid, warning);
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
