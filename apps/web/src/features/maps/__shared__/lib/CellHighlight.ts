import type Phaser from "phaser";
import { TILE_SIZE, type Cell } from "@standin/contracts";
import { EDITOR_CELL_HIGHLIGHT } from "@/features/maps/__shared__/consts/grid";

// A square over the cell under the cursor. It moves on the Phaser side only.
export class CellHighlight {
    private readonly rect: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene) {
        this.rect = scene.add.rectangle(
            0,
            0,
            TILE_SIZE,
            TILE_SIZE,
            EDITOR_CELL_HIGHLIGHT.FILL_COLOR,
            EDITOR_CELL_HIGHLIGHT.FILL_ALPHA
        );
        this.rect.setOrigin(0, 0);
        this.rect.setStrokeStyle(
            EDITOR_CELL_HIGHLIGHT.STROKE_WIDTH,
            EDITOR_CELL_HIGHLIGHT.STROKE_COLOR,
            EDITOR_CELL_HIGHLIGHT.STROKE_ALPHA
        );
        this.rect.setDepth(EDITOR_CELL_HIGHLIGHT.DEPTH);
        this.rect.setVisible(false);
    }

    show(cell: Cell): void {
        this.rect.setPosition(cell[0] * TILE_SIZE, cell[1] * TILE_SIZE);
        this.rect.setVisible(true);
    }

    hide(): void {
        this.rect.setVisible(false);
    }

    destroy(): void {
        this.rect.destroy();
    }
}
