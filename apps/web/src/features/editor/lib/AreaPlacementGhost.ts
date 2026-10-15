import type Phaser from "phaser";
import { TILE_SIZE } from "@standin/contracts";
import { AREA_GHOST } from "@/features/editor/consts/area-ghost";
import { loadTextureOnDemand } from "@/features/editor/lib/loadTextureOnDemand";
import type { AreaGhostTarget } from "@/features/editor/types/AreaGhostTarget";
import type { AreaGhostView } from "@/features/editor/types/AreaGhostView";
import { buildAreaTextureKey } from "@/features/editor/utils/buildAreaTextureKey";
import { resolveFileUrl } from "@/lib/api/assetUrl";
import { API_BASE_URL } from "@/lib/api/url";

// The translucent thumbnail of the area at native resolution, with the
// outline of its rectangle. The thumbnail loads when first needed, and until
// it arrives only the outline shows. The outline is green on a valid spot and
// red on a refused one. It moves on the Phaser side only.
export class AreaPlacementGhost implements AreaGhostView {
    private readonly scene: Phaser.Scene;
    private readonly loading = new Set<string>();
    private readonly failed = new Set<string>();
    private image: Phaser.GameObjects.Image | null = null;
    private outline: Phaser.GameObjects.Graphics | null = null;
    private last: AreaGhostTarget | null = null;
    private destroyed = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    show(target: AreaGhostTarget): void {
        if (this.destroyed) return;
        this.last = target;

        this.drawOutline(target);
        this.drawImage(target);
    }

    hide(): void {
        this.last = null;
        this.image?.setVisible(false);
        this.outline?.setVisible(false);
    }

    destroy(): void {
        this.destroyed = true;
        this.last = null;
        this.image?.destroy();
        this.outline?.destroy();
        this.image = null;
        this.outline = null;
    }

    private drawOutline({ area, tileX, tileY, valid }: AreaGhostTarget): void {
        this.outline ??= this.scene.add
            .graphics()
            .setDepth(AREA_GHOST.DEPTH + 1);

        const color = valid ? AREA_GHOST.VALID_COLOR : AREA_GHOST.INVALID_COLOR;
        this.outline.clear();
        this.outline.lineStyle(
            AREA_GHOST.OUTLINE_WIDTH,
            color,
            AREA_GHOST.OUTLINE_ALPHA
        );
        this.outline.strokeRect(
            tileX * TILE_SIZE,
            tileY * TILE_SIZE,
            area.width * TILE_SIZE,
            area.height * TILE_SIZE
        );
        this.outline.setVisible(true);
    }

    private drawImage({ area, tileX, tileY }: AreaGhostTarget): void {
        const key = buildAreaTextureKey(area.id, area.version);
        if (!this.scene.textures.exists(key)) {
            this.image?.setVisible(false);
            this.requestTexture(key, area.thumbnailUrl);
            return;
        }

        if (this.image?.texture.key !== key) {
            this.image?.destroy();
            this.image = this.scene.add
                .image(0, 0, key)
                .setOrigin(0, 0)
                .setDepth(AREA_GHOST.DEPTH)
                .setAlpha(AREA_GHOST.ALPHA);
        }
        this.image.setPosition(tileX * TILE_SIZE, tileY * TILE_SIZE);
        this.image.setVisible(true);
    }

    // One load per thumbnail. When it arrives, the ghost draws again at the
    // last spot if the cursor is still on the same area.
    private requestTexture(key: string, url: string): void {
        if (this.loading.has(key) || this.failed.has(key)) return;
        this.loading.add(key);

        const resolvedUrl = resolveFileUrl(url, API_BASE_URL);
        void loadTextureOnDemand(this.scene, key, (loader) => {
            loader.image(key, resolvedUrl);
        }).then((loaded) => {
            this.loading.delete(key);
            if (!loaded) this.failed.add(key);
            if (this.destroyed) return;

            const target = this.last;
            if (!target) return;
            if (
                buildAreaTextureKey(target.area.id, target.area.version) === key
            ) {
                this.show(target);
            }
        });
    }
}
