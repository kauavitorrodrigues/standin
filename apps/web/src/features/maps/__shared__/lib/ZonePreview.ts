import type Phaser from "phaser";
import { TILE_SIZE, type Cell } from "@standin/contracts";
import { EDITOR_ZONE_PREVIEW } from "@/features/maps/__shared__/consts/zone-preview";
import { EDITOR_ZONES } from "@/features/maps/__shared__/consts/zones";
import type { ZoneRect } from "@/features/maps/__shared__/types/zone-rect";

const HALF = 2;

// What the zone tool shows while it works: a ghost marker where a spawn would
// go, and the rectangle being dragged for an area. It lives on the Phaser side
// only, so a pointer move never goes through React.
export class ZonePreview {
    private readonly graphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene) {
        this.graphics = scene.add.graphics();
        this.graphics.setDepth(EDITOR_ZONE_PREVIEW.DEPTH);
        this.graphics.setVisible(false);
    }

    showSpawn(cell: Cell): void {
        this.graphics.clear();
        this.graphics.fillStyle(
            EDITOR_ZONES.SPAWN_COLOR,
            EDITOR_ZONE_PREVIEW.GHOST_ALPHA
        );
        this.graphics.fillCircle(
            cell[0] * TILE_SIZE + TILE_SIZE / HALF,
            cell[1] * TILE_SIZE + TILE_SIZE / HALF,
            EDITOR_ZONES.SPAWN_RADIUS
        );
        this.graphics.setVisible(true);
    }

    // `valid` false draws it in red: the area is too small to be created.
    showArea(rect: ZoneRect, valid: boolean): void {
        const color = valid
            ? EDITOR_ZONES.AREA_COLOR
            : EDITOR_ZONE_PREVIEW.INVALID_COLOR;
        const x = rect.x * TILE_SIZE;
        const y = rect.y * TILE_SIZE;
        const width = rect.w * TILE_SIZE;
        const height = rect.h * TILE_SIZE;

        this.graphics.clear();
        this.graphics.fillStyle(color, EDITOR_ZONE_PREVIEW.FILL_ALPHA);
        this.graphics.lineStyle(
            EDITOR_ZONES.OUTLINE_WIDTH,
            color,
            EDITOR_ZONE_PREVIEW.OUTLINE_ALPHA
        );
        this.graphics.fillRect(x, y, width, height);
        this.graphics.strokeRect(x, y, width, height);
        this.graphics.setVisible(true);
    }

    hide(): void {
        this.graphics.clear();
        this.graphics.setVisible(false);
    }

    destroy(): void {
        this.graphics.destroy();
    }
}
