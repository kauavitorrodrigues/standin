import type Phaser from "phaser";
import {
    TILE_SIZE,
    type AssetDefinition,
    type PlacedAsset,
} from "@standin/contracts";
import {
    buildAssetAnimationKey,
    buildAssetTextureKey,
} from "@/features/game/utils/map";
import {
    resolvePlacedLayout,
    shouldPlayAnimation,
} from "@/features/game/utils/placed";
import { EDITOR_OBJECT_PLACEHOLDER } from "@/features/maps/__shared__/consts/placed-objects";
import { loadAssetTexture } from "@/features/maps/__shared__/lib/loadAssetTexture";
import { OBJECT_DROP } from "@/features/maps/__shared__/consts/object-drop";
import { prefersReducedMotion } from "@/features/maps/__shared__/utils/prefersReducedMotion";
import { diffPlaced } from "@/features/maps/__shared__/utils/diffPlaced";

// The `type` Phaser gives a sprite, to tell it from the placeholder rectangle.
const SPRITE_TYPE = "Sprite";

export type PlacedDisplay =
    Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle;

// The placed objects of the map as sprites, updated one by one. Position and
// depth follow the rules of the game (`resolvePlacedLayout`), so an item on a
// desk sits on its parent and draws just over it. A rectangle of the footprint
// size stands in until the texture of the asset loads, except for an object
// that already has a sprite: a swap keeps the old one until the new is ready.
export class EditorObjectRenderer {
    private readonly displays = new Map<string, PlacedDisplay>();
    private readonly placedById = new Map<string, PlacedAsset>();
    private readonly assetsById = new Map<string, AssetDefinition>();
    private readonly drops = new Map<string, Phaser.Tweens.TweenChain>();
    private readonly loading = new Set<string>();
    private readonly pendingLoads = new Set<Promise<void>>();
    private readonly scene: Phaser.Scene;
    private readonly mapHeightPx: number;
    private destroyed = false;

    constructor(
        scene: Phaser.Scene,
        assets: readonly AssetDefinition[],
        mapHeightPx: number
    ) {
        this.scene = scene;
        this.mapHeightPx = mapHeightPx;
        this.setAssets(assets);
    }

    // Assets the objects may use. Needed before an object of a new asset is added.
    setAssets(assets: readonly AssetDefinition[]): void {
        assets.forEach((asset) => this.assetsById.set(asset.id, asset));
    }

    add(placed: PlacedAsset): void {
        this.placedById.set(placed.id, placed);
        this.redrawWithChildren([placed.id]);
    }

    move(placed: PlacedAsset): void {
        this.placedById.set(placed.id, placed);
        this.redrawWithChildren([placed.id]);
    }

    replace(placed: PlacedAsset): void {
        this.placedById.set(placed.id, placed);
        this.redrawWithChildren([placed.id]);
    }

    remove(id: string): void {
        this.placedById.delete(id);
        this.destroyDisplay(id);
        this.redrawChildrenOf(new Set([id]));
    }

    // Brings the drawing to `next` by applying only the difference. With
    // `animate`, an object added or moved by it plays the drop effect (a swap
    // of asset does not).
    sync(
        next: readonly PlacedAsset[],
        { animate = false }: { animate?: boolean } = {}
    ): void {
        const diff = diffPlaced([...this.placedById.values()], next);

        diff.removed.forEach((id) => {
            this.placedById.delete(id);
            this.destroyDisplay(id);
        });
        const changed = [...diff.added, ...diff.replaced, ...diff.moved];
        changed.forEach((item) => this.placedById.set(item.id, item));

        const touched = new Set([
            ...changed.map((item) => item.id),
            ...diff.removed,
        ]);
        this.redrawWithChildren(
            changed.map((item) => item.id),
            touched
        );

        if (!animate) return;
        [...diff.added, ...diff.moved].forEach((item) =>
            this.playDrop(item.id)
        );
    }

    // The sprites and placeholders on screen, for the map photo.
    getDisplays(): PlacedDisplay[] {
        return [...this.displays.values()];
    }

    // Resolves when no texture is loading, so a photo shows sprites and not
    // placeholders. A load that settles can start no other.
    async settled(): Promise<void> {
        while (this.pendingLoads.size > 0) {
            await Promise.all([...this.pendingLoads]);
        }
    }

    destroy(): void {
        this.destroyed = true;
        this.drops.forEach((drop) => drop.stop());
        this.drops.clear();
        this.displays.forEach((display) => display.destroy());
        this.displays.clear();
        this.placedById.clear();
    }

    private redrawWithChildren(
        ids: readonly string[],
        parents: ReadonlySet<string> = new Set(ids)
    ): void {
        ids.forEach((id) => this.redraw(id));
        this.redrawChildrenOf(parents);
    }

    // Items on a parent follow it, so they are laid out again when it changes.
    private redrawChildrenOf(parents: ReadonlySet<string>): void {
        this.placedById.forEach((item) => {
            if (item.parentId === null || !parents.has(item.parentId)) return;
            this.redraw(item.id);
        });
    }

    private destroyDisplay(id: string): void {
        this.drops.get(id)?.stop();
        this.drops.delete(id);
        this.displays.get(id)?.destroy();
        this.displays.delete(id);
    }

    private redraw(id: string): void {
        const placed = this.placedById.get(id);
        const asset = placed ? this.assetsById.get(placed.assetId) : undefined;
        if (!placed || !asset) return;

        const layout = resolvePlacedLayout(
            placed,
            this.assetsById,
            this.placedById,
            this.mapHeightPx
        );
        if (!layout) {
            this.destroyDisplay(id);
            return;
        }

        const textureKey = buildAssetTextureKey(asset.id);
        if (!this.scene.textures.exists(textureKey)) {
            this.requestTexture(asset);
            // A swap keeps the sprite it had until the new texture arrives,
            // so the object never blinks into a placeholder. The load
            // redraws it when it settles.
            if (this.displays.get(id)?.type === SPRITE_TYPE) return;
            this.destroyDisplay(id);
            this.displays.set(id, this.createPlaceholder(asset, layout));
            return;
        }

        this.destroyDisplay(id);

        this.displays.set(id, this.createSprite(placed, asset, layout));
    }

    // The squash: the sprite is anchored at its feet, so pressing it down
    // keeps it on the ground, and its x follows the width change to stay
    // centered. A placeholder (texture still loading) has no effect.
    private playDrop(id: string): void {
        const display = this.displays.get(id);
        if (display?.type !== SPRITE_TYPE || prefersReducedMotion()) return;

        const sprite = display as Phaser.GameObjects.Sprite;
        const baseX = sprite.x;
        const keepCentered = () => {
            sprite.x = baseX + (sprite.width * (1 - sprite.scaleX)) / 2;
        };
        const drop = this.scene.tweens.chain({
            targets: sprite,
            tweens: [
                {
                    scaleX: OBJECT_DROP.SQUASH_SCALE_X,
                    scaleY: OBJECT_DROP.SQUASH_SCALE_Y,
                    duration: OBJECT_DROP.SQUASH_MS,
                    ease: OBJECT_DROP.SQUASH_EASE,
                    onUpdate: keepCentered,
                },
                {
                    scaleX: 1,
                    scaleY: 1,
                    duration: OBJECT_DROP.SETTLE_MS,
                    ease: OBJECT_DROP.SETTLE_EASE,
                    onUpdate: keepCentered,
                },
            ],
            onComplete: () => {
                sprite.setScale(1);
                sprite.x = baseX;
                this.drops.delete(id);
            },
        });
        this.drops.set(id, drop);
    }

    private createSprite(
        placed: PlacedAsset,
        asset: AssetDefinition,
        layout: { x: number; bottomY: number; depth: number }
    ): Phaser.GameObjects.Sprite {
        const sprite = this.scene.add.sprite(
            layout.x,
            layout.bottomY,
            buildAssetTextureKey(asset.id)
        );
        sprite.setOrigin(0, 1);
        sprite.setDepth(layout.depth);
        sprite.setName(placed.id);

        const animationKey = buildAssetAnimationKey(asset.id);
        if (shouldPlayAnimation(asset, this.scene.anims.exists(animationKey))) {
            sprite.play(animationKey);
        }
        return sprite;
    }

    private createPlaceholder(
        asset: AssetDefinition,
        layout: { x: number; bottomY: number; depth: number }
    ): Phaser.GameObjects.Rectangle {
        const rect = this.scene.add.rectangle(
            layout.x,
            layout.bottomY,
            asset.footprint.w * TILE_SIZE,
            asset.footprint.h * TILE_SIZE,
            EDITOR_OBJECT_PLACEHOLDER.FILL_COLOR,
            EDITOR_OBJECT_PLACEHOLDER.FILL_ALPHA
        );
        rect.setOrigin(0, 1);
        rect.setStrokeStyle(
            EDITOR_OBJECT_PLACEHOLDER.STROKE_WIDTH,
            EDITOR_OBJECT_PLACEHOLDER.STROKE_COLOR,
            EDITOR_OBJECT_PLACEHOLDER.STROKE_ALPHA
        );
        rect.setDepth(layout.depth);
        return rect;
    }

    // One load per asset, however many objects use it. When it settles, every
    // object of the asset swaps the placeholder for the sprite.
    private requestTexture(asset: AssetDefinition): void {
        if (this.loading.has(asset.id)) return;
        this.loading.add(asset.id);

        const load = loadAssetTexture(this.scene, asset).then(() => {
            this.loading.delete(asset.id);
            if (this.destroyed) return;

            this.placedById.forEach((item) => {
                if (item.assetId === asset.id) this.redraw(item.id);
            });
        });
        const tracked = load.finally(() => this.pendingLoads.delete(tracked));
        this.pendingLoads.add(tracked);
    }
}
