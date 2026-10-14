import type Phaser from "phaser";
import { OBJECT_OUTLINE } from "@/features/maps/__shared__/consts/object-outline";
import type { ObjectBounds } from "@/features/maps/__shared__/types/ObjectBounds";

// Draws the box of an object on a Graphics, a little larger than the image.
// The hover and the selection both draw it, so they always look the same.
export const drawObjectOutline = (
    graphics: Phaser.GameObjects.Graphics,
    bounds: Pick<ObjectBounds, "x" | "y" | "width" | "height">
): void => {
    const { PADDING } = OBJECT_OUTLINE;
    const x = bounds.x - PADDING;
    const y = bounds.y - PADDING;
    const width = bounds.width + PADDING * 2;
    const height = bounds.height + PADDING * 2;

    graphics.fillStyle(OBJECT_OUTLINE.COLOR, OBJECT_OUTLINE.FILL_ALPHA);
    graphics.fillRect(x, y, width, height);
    graphics.lineStyle(
        OBJECT_OUTLINE.LINE_WIDTH,
        OBJECT_OUTLINE.COLOR,
        OBJECT_OUTLINE.LINE_ALPHA
    );
    graphics.strokeRect(x, y, width, height);
};
