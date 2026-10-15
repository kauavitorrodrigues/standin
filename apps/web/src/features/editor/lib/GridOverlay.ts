import type Phaser from "phaser";
import { TILE_SIZE } from "@standin/contracts";
import { EDITOR_GRID } from "@/features/editor/consts/grid";

// Lines at every tile over the whole map, drawn once and shown or hidden.
export class GridOverlay {
    private readonly graphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, mapWidth: number, mapHeight: number) {
        this.graphics = scene.add.graphics();
        this.graphics.setDepth(EDITOR_GRID.DEPTH);
        this.graphics.lineStyle(
            EDITOR_GRID.LINE_WIDTH,
            EDITOR_GRID.LINE_COLOR,
            EDITOR_GRID.LINE_ALPHA
        );

        for (let x = 0; x <= mapWidth; x += TILE_SIZE) {
            this.graphics.lineBetween(x, 0, x, mapHeight);
        }
        for (let y = 0; y <= mapHeight; y += TILE_SIZE) {
            this.graphics.lineBetween(0, y, mapWidth, y);
        }
    }

    setVisible(visible: boolean): void {
        this.graphics.setVisible(visible);
    }

    destroy(): void {
        this.graphics.destroy();
    }
}
