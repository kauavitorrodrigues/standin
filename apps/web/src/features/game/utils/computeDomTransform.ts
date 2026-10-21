// A 2D affine matrix in the order Phaser and CSS share: x' = a x + c y + e and
// y' = b x + d y + f.
export type Matrix2D = {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
};

type Params = {
    // The matrix of the camera, which holds its zoom.
    camera: Matrix2D;
    scroll: { x: number; y: number };
    // The point of the world the element is anchored at.
    position: { x: number; y: number };
    // The size of the element in CSS px, and the point of it that sits on the
    // position, as a fraction of that size.
    size: { width: number; height: number };
    origin: { x: number; y: number };
    // 1 keeps the size the camera gives it, so it follows the zoom. The inverse
    // of the zoom cancels it, and the element keeps its size on the screen.
    scale: number;
    // Snaps the element to whole screen px, like the sprites of the game, which
    // Phaser draws at whole px with `roundPixels`. It also keeps the text and
    // the edges of the element sharp. Only a plain translation is snapped.
    roundToPixel?: boolean;
};

// The CSS transform that puts a DOM element over a point of the world. The
// element must have `transform-origin` at `origin` in percent, so the scale
// grows around the anchor and the anchor stays on the point.
export const computeDomTransform = ({
    camera,
    scroll,
    position,
    size,
    origin,
    scale,
    roundToPixel = false,
}: Params): string => {
    const x = position.x - scroll.x;
    const y = position.y - scroll.y;

    const a = camera.a * scale;
    const b = camera.b * scale;
    const c = camera.c * scale;
    const d = camera.d * scale;
    const e = camera.a * x + camera.c * y + camera.e - size.width * origin.x;
    const f = camera.b * x + camera.d * y + camera.f - size.height * origin.y;

    const isTranslation = a === 1 && b === 0 && c === 0 && d === 1;
    if (!isTranslation) return `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`;

    return roundToPixel
        ? `translate(${Math.round(e)}px, ${Math.round(f)}px)`
        : `translate(${e}px, ${f}px)`;
};

// The scale that keeps an element the same size on the screen at any zoom.
export const getCounterZoomScale = (zoom: number): number =>
    zoom > 0 ? 1 / zoom : 1;
