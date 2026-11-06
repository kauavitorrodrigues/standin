import type { Cell } from "@standin/contracts";
import { TILE_PREVIEW_KINDS } from "@/features/editor/consts/tilePreview";
import { TilePreview } from "@/features/editor/lib/TilePreview";
import { isSameCell } from "@/features/editor/utils/isSameCell";
import type Phaser from "phaser";

type Move = {
    // Shift held: the preview is the rectangle, not the path.
    shift: boolean;
    start: Cell;
    cell: Cell;
    // The cells the drag covered with this move, and all of them so far.
    added: readonly Cell[];
    covered: readonly Cell[];
};

// What the eraser shows while it drags: the path of the pointer, or with Shift
// the rectangle between the press and the pointer. Letting go of Shift brings
// the path back. The rectangle is drawn as one shape and only when the pointer
// changes cell.
export class ErasePreview {
    private readonly preview: TilePreview;
    private showsArea = false;
    private lastAreaCell: Cell | null = null;

    constructor(scene: Phaser.Scene) {
        this.preview = new TilePreview(scene, TILE_PREVIEW_KINDS.ERASE);
    }

    begin(cell: Cell): void {
        this.preview.set([cell]);
    }

    update({ shift, start, cell, added, covered }: Move): void {
        if (shift) {
            this.drawArea(start, cell);
            return;
        }
        if (this.showsArea) {
            this.drawPath(covered);
            return;
        }
        this.preview.add(added);
    }

    clear(): void {
        this.showsArea = false;
        this.lastAreaCell = null;
        this.preview.clear();
    }

    destroy(): void {
        this.preview.destroy();
    }

    private drawArea(start: Cell, cell: Cell): void {
        if (this.showsArea && isSameCell(this.lastAreaCell, cell)) return;

        this.showsArea = true;
        this.lastAreaCell = cell;
        this.preview.setRect(start, cell);
    }

    private drawPath(covered: readonly Cell[]): void {
        this.showsArea = false;
        this.lastAreaCell = null;
        this.preview.set(covered);
    }
}
