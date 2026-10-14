import type Phaser from "phaser";
import { TILE_SIZE } from "@standin/contracts";
import { ZONE_MOVE_GHOST } from "@/features/editor/consts/zone-move-ghost";
import { loadTextureOnDemand } from "@/features/editor/lib/loadTextureOnDemand";
import type { ZoneMoveGhostView } from "@/features/editor/types/ZoneMoveGhostView";
import type { ZoneRect } from "@/features/editor/types/zone-rect";

// The picture of the area, taken from the map when the drag starts, drawn at
// native resolution where the area would land. Until the picture is ready
// only the zone preview shows. It lives on the Phaser side only.
export class ZoneMoveGhost implements ZoneMoveGhostView {
    private readonly scene: Phaser.Scene;
    private image: Phaser.GameObjects.Image | null = null;
    private key: string | null = null;
    private url: string | null = null;
    private last: ZoneRect | null = null;
    private generation = 0;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    prepare(_rect: ZoneRect, snapshot: Promise<Blob>): void {
        this.release();
        const generation = this.generation;
        const key = `${ZONE_MOVE_GHOST.TEXTURE_PREFIX}:${generation}`;

        void snapshot
            .then((blob) => {
                if (generation !== this.generation) return;

                const url = URL.createObjectURL(blob);
                this.url = url;
                return loadTextureOnDemand(this.scene, key, (loader) => {
                    loader.image(key, url);
                });
            })
            .then((loaded) => {
                if (!loaded || generation !== this.generation) return;
                this.key = key;
                if (this.last) this.show(this.last);
            })
            .catch(() => undefined);
    }

    show(rect: ZoneRect): void {
        this.last = rect;
        if (!this.key) return;

        this.image ??= this.scene.add
            .image(0, 0, this.key)
            .setOrigin(0, 0)
            .setDepth(ZONE_MOVE_GHOST.DEPTH)
            .setAlpha(ZONE_MOVE_GHOST.ALPHA);
        this.image.setPosition(rect.x * TILE_SIZE, rect.y * TILE_SIZE);
        this.image.setVisible(true);
    }

    release(): void {
        this.generation += 1;
        this.last = null;
        this.image?.destroy();
        this.image = null;
        if (this.key && this.scene.textures.exists(this.key)) {
            this.scene.textures.remove(this.key);
        }
        this.key = null;
        if (this.url) URL.revokeObjectURL(this.url);
        this.url = null;
    }
}
