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
    type PlacedLayout,
} from "@/features/game/utils/placed";
import { EDITOR_OBJECT_PLACEHOLDER } from "@/features/game/consts/placed-objects";
import { loadAssetTexture } from "@/features/editor/lib/loadAssetTexture";
import { OBJECT_DROP } from "@/features/game/consts/object-drop";
import { prefersReducedMotion } from "@/features/game/utils/prefersReducedMotion";
import { diffPlaced } from "@/features/game/renderers/diffPlaced";

// The `type` Phaser gives a sprite, to tell it from the placeholder rectangle.
const SPRITE_TYPE = "Sprite";

export type PlacedDisplay =
    Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle;

// The placed objects of the map as sprites, updated one by one. Position and
// depth follow the rules of the game (`resolvePlacedLayout`), so an item on a
// desk sits on its parent and draws just over it. An object whose footprint has
// a mask is several sprites, one cropped slice per footprint row. A rectangle of
// the footprint size stands in until the texture of the asset loads, except for
// an object that already has a sprite: a swap keeps the old one until the new
// is ready.
export class EditorObjectRenderer {
    private readonly displays = new Map<string, PlacedDisplay[]>();
    private readonly placedById = new Map<string, PlacedAsset>();
    private readonly assetsById = new Map<string, AssetDefinition>();
    private readonly drops = new Map<string, Phaser.Tweens.TweenChain>();
    // The whole sprite that stands in for the slices of an object while it
    // drops, so the squash scales one image and not several.
    private readonly dropProxies = new Map<string, Phaser.GameObjects.Sprite>();
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
        return [...this.displays.values()].flat();
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
        this.dropProxies.forEach((proxy) => proxy.destroy());
        this.dropProxies.clear();
        this.displays.forEach((displays) =>
            displays.forEach((display) => display.destroy())
        );
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
        this.dropProxies.get(id)?.destroy();
        this.dropProxies.delete(id);
        this.displays.get(id)?.forEach((display) => display.destroy());
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
            if (this.displays.get(id)?.[0]?.type === SPRITE_TYPE) return;
            this.destroyDisplay(id);
            this.displays.set(id, [this.createPlaceholder(asset, layout)]);
            return;
        }

        this.destroyDisplay(id);

        this.displays.set(id, this.createSprites(placed, asset, layout));
    }

    // The squash: the sprite is anchored at its feet, so pressing it down
    // keeps it on the ground, and its x follows the width change to stay
    // centered. A placeholder (texture still loading) has no effect.
    private playDrop(id: string): void {
        const displays = this.displays.get(id);
        if (displays?.[0]?.type !== SPRITE_TYPE || prefersReducedMotion()) {
            return;
        }

        // An object cut into slices drops as one whole sprite: scaling each
        // slice on its own makes the edges between them shimmer.
        const sliced = displays as Phaser.GameObjects.Sprite[];
        const proxy =
            sliced.length > 1 ? this.createDropProxy(id, sliced) : null;
        const sprites = proxy ? [proxy] : sliced;
        const baseX = sprites[0]!.x;
        const keepCentered = () => {
            sprites.forEach((sprite) => {
                sprite.x = baseX + (sprite.width * (1 - sprite.scaleX)) / 2;
            });
        };
        const drop = this.scene.tweens.chain({
            targets: sprites,
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
                sprites.forEach((sprite) => {
                    sprite.setScale(1);
                    sprite.x = baseX;
                });
                this.drops.delete(id);
                if (!proxy) return;
                proxy.destroy();
                this.dropProxies.delete(id);
                sliced.forEach((slice) => slice.setVisible(true));
            },
        });
        this.drops.set(id, drop);
    }

    // A sprite of the whole image where the slices are, hiding them until the
    // drop ends. It sits at the depth of the base of the object.
    private createDropProxy(
        id: string,
        slices: Phaser.GameObjects.Sprite[]
    ): Phaser.GameObjects.Sprite {
        const first = slices[0]!;
        const proxy = this.scene.add.sprite(
            first.x,
            first.y,
            first.texture.key,
            first.frame.name
        );
        proxy.setOrigin(0, 1);
        proxy.setDepth(Math.max(...slices.map((slice) => slice.depth)));
        proxy.setName(id);
        slices.forEach((slice) => slice.setVisible(false));
        this.dropProxies.set(id, proxy);
        return proxy;
    }

    private createSprites(
        placed: PlacedAsset,
        asset: AssetDefinition,
        layout: PlacedLayout
    ): Phaser.GameObjects.Sprite[] {
        const animationKey = buildAssetAnimationKey(asset.id);
        const animated = shouldPlayAnimation(
            asset,
            this.scene.anims.exists(animationKey)
        );

        return layout.slices.map((slice) => {
            const sprite = this.scene.add.sprite(
                layout.x,
                layout.bottomY,
                buildAssetTextureKey(asset.id)
            );
            sprite.setOrigin(0, 1);
            sprite.setDepth(slice.depth);
            sprite.setName(placed.id);
            if (slice.crop) {
                sprite.setCrop(
                    0,
                    slice.crop.y,
                    asset.sprite.w,
                    slice.crop.height
                );
            }
            if (animated) sprite.play(animationKey);
            return sprite;
        });
    }

    private createPlaceholder(
        asset: AssetDefinition,
        layout: PlacedLayout
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
