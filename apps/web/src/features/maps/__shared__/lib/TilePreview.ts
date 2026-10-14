import type Phaser from "phaser";
import { TILE_SIZE, type Cell } from "@standin/contracts";
import { TILE_PREVIEW } from "@/features/maps/__shared__/consts/tilePreview";
import type { TilePreviewKind } from "@/features/maps/__shared__/types/tile-preview-kind";
import { getTilePreviewColor } from "@/features/maps/__shared__/utils/getTilePreviewColor";

// The cells a tile gesture is about to change, as a colored layer over the
// map. It lives on the Phaser side only: a tool fills it while the button is
// down and clears it on release and on cancel.
export class TilePreview {
    private readonly graphics: Phaser.GameObjects.Graphics;
    private readonly color: number;

    constructor(scene: Phaser.Scene, kind: TilePreviewKind) {
        this.color = getTilePreviewColor(kind);
        this.graphics = scene.add.graphics();
        this.graphics.setDepth(TILE_PREVIEW.DEPTH);
        this.graphics.fillStyle(this.color, TILE_PREVIEW.FILL_ALPHA);
    }

    // Adds cells to what is shown, without redrawing the ones already there.
    add(cells: readonly Cell[]): void {
        for (const [x, y] of cells) {
            this.graphics.fillRect(
                x * TILE_SIZE,
                y * TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE
            );
        }
    }

    // Shows exactly these cells.
    set(cells: readonly Cell[]): void {
        this.clear();
        this.add(cells);
    }

    clear(): void {
        this.graphics.clear();
        // clear() drops the fill style too in Phaser, so it is set again.
        this.graphics.fillStyle(this.color, TILE_PREVIEW.FILL_ALPHA);
    }

    destroy(): void {
        this.graphics.destroy();
    }
}
