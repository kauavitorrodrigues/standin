import type Phaser from "phaser";
import { OBJECT_OUTLINE } from "@/features/editor/consts/object-outline";
import type {
    ObjectBounds,
    ObjectShape,
} from "@/features/editor/types/ObjectBounds";

// Draws the outline of an object whose footprint is thinner than its box: the
// occupied cells filled, and the edge around them.
const drawShapeOutline = (
    graphics: Phaser.GameObjects.Graphics,
    shape: ObjectShape
): void => {
    graphics.fillStyle(OBJECT_OUTLINE.COLOR, OBJECT_OUTLINE.FILL_ALPHA);
    shape.rects.forEach(({ x, y, width, height }) =>
        graphics.fillRect(x, y, width, height)
    );
    graphics.lineStyle(
        OBJECT_OUTLINE.LINE_WIDTH,
        OBJECT_OUTLINE.COLOR,
        OBJECT_OUTLINE.LINE_ALPHA
    );
    shape.segments.forEach(({ x1, y1, x2, y2 }) => {
        graphics.lineBetween(x1, y1, x2, y2);
    });
};

// Draws the box of an object on a Graphics, a little larger than the image.
// The hover and the selection both draw it, so they always look the same.
export const drawObjectOutline = (
    graphics: Phaser.GameObjects.Graphics,
    bounds: Pick<ObjectBounds, "x" | "y" | "width" | "height" | "shape">
): void => {
    if (bounds.shape) {
        drawShapeOutline(graphics, bounds.shape);
        return;
    }
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
